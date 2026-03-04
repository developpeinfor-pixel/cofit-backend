import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Payment } from '../payments/entities/payment.entity';
import { SupporterCard } from '../supporter-cards/entities/supporter-card.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { Competition } from '../competitions/entities/competition.entity';
import { Role } from '../common/enums/role.enum';
import { MatchStatus } from '../common/enums/match-status.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(SupporterCard)
    private readonly supporterCardsRepository: Repository<SupporterCard>,
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(Competition)
    private readonly competitionsRepository: Repository<Competition>,
  ) {}

  async getDashboard(actor: { userId: string; role: Role }) {
    const currentAdmin = await this.usersRepository.findOne({
      where: { id: actor.userId },
    });
    const today = new Date().toISOString().slice(0, 10);
    const isGeneral = actor.role === Role.ADMIN_GENERAL;

    const [adminsCount, usersCount, currentCompetition] = await Promise.all([
      this.usersRepository.count({
        where: {
          role: In([Role.ADMIN_GENERAL, Role.ADMIN_SENIOR, Role.ADMIN_JUNIOR]),
        },
      }),
      this.usersRepository.count({ where: { role: Role.USER } }),
      this.competitionsRepository
        .createQueryBuilder('competition')
        .where('competition.start_date <= :today', { today })
        .andWhere('(competition.end_date IS NULL OR competition.end_date >= :today)', { today })
        .orderBy('competition.start_date', 'DESC')
        .addOrderBy('competition.created_at', 'DESC')
        .getOne(),
    ]);

    const fallbackCompetition =
      currentCompetition ??
      (await this.competitionsRepository.findOne({
        order: { created_at: 'DESC' },
      }));
    const competitionInProgress = fallbackCompetition ?? null;

    const competitionMatches = competitionInProgress
      ? await this.matchesRepository.find({
          where: { competition_id: competitionInProgress.id },
        })
      : [];
    const matchPlannedCount = competitionMatches.length;
    const matchRemainingCount = competitionMatches.filter(
      (match) => match.status !== MatchStatus.FINISHED,
    ).length;

    const teamIds = Array.from(
      new Set(
        competitionMatches.flatMap((match) => [match.home_team_id, match.away_team_id]),
      ),
    );
    const competitionTeams = teamIds.length
      ? await this.teamsRepository.find({
          where: { id: In(teamIds) },
          order: { name: 'ASC' },
        })
      : [];

    const response: Record<string, unknown> = {
      current_admin_first_name: currentAdmin?.first_name ?? '',
      current_admin_last_name: currentAdmin?.last_name ?? '',
      admins_count: adminsCount,
      users_count: usersCount,
      current_competition: competitionInProgress
        ? {
            id: competitionInProgress.id,
            name: competitionInProgress.name,
            season: competitionInProgress.season,
            start_date: competitionInProgress.start_date ?? null,
            end_date: competitionInProgress.end_date ?? null,
          }
        : null,
      competition_teams_count: competitionTeams.length,
      competition_teams: competitionTeams.map((team) => ({
        id: team.id,
        name: team.name,
        short_name: team.short_name ?? null,
      })),
      competition_matches_planned_count: matchPlannedCount,
      competition_matches_remaining_count: matchRemainingCount,
      premium_and_ticket_stats_visible: isGeneral,
    };

    if (isGeneral) {
      const [ticketsCount, supporterCardsCount, paidPayments] = await Promise.all([
        this.ticketsRepository.count(),
        this.supporterCardsRepository.count(),
        this.paymentsRepository.find({
          where: { status: PaymentStatus.SUCCESS },
        }),
      ]);

      const revenue = paidPayments.reduce((sum, payment) => {
        return sum + Number(payment.amount ?? 0);
      }, 0);

      response.tickets_sold = ticketsCount;
      response.supporter_cards_sold = supporterCardsCount;
      response.revenue_total = revenue;
      response.payments_count = paidPayments.length;
    }

    return response;
  }

  private async buildStatsRows() {
    const [matches, teams, competitions] = await Promise.all([
      this.matchesRepository.find({
        order: { match_date: 'DESC', kickoff_time: 'DESC' },
      }),
      this.teamsRepository.find(),
      this.competitionsRepository.find(),
    ]);

    const teamsById = new Map(teams.map((team) => [team.id, team.name]));
    const competitionsById = new Map(
      competitions.map((competition) => [competition.id, competition.name]),
    );

    return matches.map((match) => {
      const stats =
        match.match_stats && typeof match.match_stats === 'object'
          ? match.match_stats
          : {};
      const manOfMatch =
        match.man_of_the_match && typeof match.man_of_the_match === 'object'
          ? match.man_of_the_match
          : {};

      const statValue = (key: string) => {
        const value = (stats as Record<string, unknown>)[key];
        return value == null ? '' : String(value);
      };

      return {
        match_date: match.match_date,
        kickoff_time: match.kickoff_time,
        competition: match.competition_id
          ? competitionsById.get(match.competition_id) ?? ''
          : '',
        home_team: teamsById.get(match.home_team_id) ?? match.home_team_id,
        away_team: teamsById.get(match.away_team_id) ?? match.away_team_id,
        score: `${match.home_score}-${match.away_score}`,
        status: match.status,
        total_corners: statValue('total_corners'),
        set_pieces: statValue('set_pieces'),
        throw_ins: statValue('throw_ins'),
        shots_total: statValue('shots_total'),
        shots_on_target: statValue('shots_on_target'),
        shots_off_target: statValue('shots_off_target'),
        possession_home: statValue('possession_home'),
        possession_away: statValue('possession_away'),
        yellow_cards_home: statValue('yellow_cards_home'),
        yellow_cards_away: statValue('yellow_cards_away'),
        red_cards_home: statValue('red_cards_home'),
        red_cards_away: statValue('red_cards_away'),
        offsides_home: statValue('offsides_home'),
        offsides_away: statValue('offsides_away'),
        fouls_home: statValue('fouls_home'),
        fouls_away: statValue('fouls_away'),
        passes_home: statValue('passes_home'),
        passes_away: statValue('passes_away'),
        saves_home: statValue('saves_home'),
        saves_away: statValue('saves_away'),
        man_of_the_match:
          (manOfMatch as Record<string, unknown>)['full_name'] != null
            ? String((manOfMatch as Record<string, unknown>)['full_name'])
            : '',
      };
    });
  }

  async exportStatsCsvBuffer() {
    const rows = await this.buildStatsRows();
    const headers = Object.keys(rows[0] ?? {
      match_date: '',
      kickoff_time: '',
      competition: '',
      home_team: '',
      away_team: '',
      score: '',
      status: '',
      total_corners: '',
      set_pieces: '',
      throw_ins: '',
      shots_total: '',
      shots_on_target: '',
      shots_off_target: '',
      possession_home: '',
      possession_away: '',
      yellow_cards_home: '',
      yellow_cards_away: '',
      red_cards_home: '',
      red_cards_away: '',
      offsides_home: '',
      offsides_away: '',
      fouls_home: '',
      fouls_away: '',
      passes_home: '',
      passes_away: '',
      saves_home: '',
      saves_away: '',
      man_of_the_match: '',
    });

    const escapeCsv = (value: string) =>
      `"${value.replaceAll('"', '""').replaceAll('\n', ' ')}"`;

    const lines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => escapeCsv(String((row as Record<string, string>)[header] ?? '')))
          .join(','),
      ),
    ];
    return Buffer.from(lines.join('\n'), 'utf8');
  }

  async exportStatsPdfBuffer() {
    const rows = await this.buildStatsRows();
    const lines = [
      'COFIT - Export Statistiques Matchs',
      `Date export: ${new Date().toISOString()}`,
      '',
      ...rows.map(
        (row) =>
          `${row.match_date} ${row.kickoff_time} | ${row.home_team} vs ${row.away_team} | ${row.score} | tirs=${row.shots_total} cadrés=${row.shots_on_target} corners=${row.total_corners} | homme=${row.man_of_the_match}`,
      ),
    ];

    return this.buildSimplePdf(lines);
  }

  private buildSimplePdf(lines: string[]) {
    const escapePdf = (input: string) =>
      input
        .replaceAll('\\', '\\\\')
        .replaceAll('(', '\\(')
        .replaceAll(')', '\\)');

    const contentLines: string[] = ['BT', '/F1 10 Tf', '50 800 Td'];
    for (let i = 0; i < lines.length; i += 1) {
      if (i > 0) {
        contentLines.push('0 -14 Td');
      }
      contentLines.push(`(${escapePdf(lines[i])}) Tj`);
    }
    contentLines.push('ET');
    const contentStream = contentLines.join('\n');

    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(contentStream, 'utf8')} >> stream\n${contentStream}\nendstream endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const object of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${object}\n`;
    }

    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
  }
}
