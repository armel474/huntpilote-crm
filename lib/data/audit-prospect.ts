/**
 * Audit de prospect — document partageable produit depuis Organic Research
 * (session 2.5). Plus léger que le rapport client mensuel (session 1.3, dont
 * il reprend la mise en page) : sert d'argument commercial avant mandat, pas
 * de suivi dans le temps.
 *
 * Démo rattachée à Spa Nordik Estrie — mêmes données que celles montrées en
 * direct dans Organic Research, pour que le chiffre envoyé au prospect soit
 * exactement celui vu à l'écran.
 */

import { CLIENTS } from '@/lib/data/clients';
import { CTR_MULT, OR_DROP, OR_TRAFFIC, POTENTIAL_ROWS, computePotentialGain } from '@/lib/data/organic-research';

const prospect = CLIENTS.find((c) => c.id === 'spa-nordik-estrie');
if (!prospect) throw new Error('Compte prospect introuvable pour la démo Audit de prospect.');

export const AUDIT_PROSPECT = {
  token: 'ap-9c2e-spanordik',
  clientId: prospect.id,
  name: prospect.name,
  domain: prospect.domain,
  preparedDate: '8 septembre 2026',
  sourceTool: 'Organic Research',
  validity: '30 jours',
  drop: {
    date: OR_DROP.date,
    label: OR_DROP.label,
    before: OR_TRAFFIC[OR_DROP.month - 1],
    after: OR_TRAFFIC[OR_DROP.month],
  },
  potentialRows: POTENTIAL_ROWS,
  potentialGain: computePotentialGain(POTENTIAL_ROWS, CTR_MULT),
};
