'use client';

/**
 * Les offres de l'agence — session 9.2 : la liste en cartes, et le
 * constructeur pour l'une d'elles. Une offre inactive reste visible,
 * atténuée : elle a pu être vendue, ses abonnements existent.
 */
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { setOfferActive } from '@/app/agence/catalogue-actions';
import type { ActionState } from '@/app/agence/action-base';
import { Notice, SectionHead } from '@/app/agence/bits';
import { OfferBuilder } from '@/app/agence/OfferBuilder';
import { OfferCard } from '@/app/agence/OfferCard';
import { IcoLock, IcoPlus } from '@/components/ui/Icons';
import { toDraft } from '@/lib/data/offres';
import type { CatalogueItem, Offer } from '@/lib/queries/agence';

export const NEW_OFFER = 'nouvelle';

export function OffresPanel({
  offers,
  items,
  canManage,
  openId,
  onOpen,
  onOpenArticle,
}: {
  offers: Offer[];
  items: CatalogueItem[];
  canManage: boolean;
  /** L'offre ouverte dans le constructeur, `nouvelle`, ou null pour la liste. */
  openId: string | null;
  onOpen: (id: string | null) => void;
  onOpenArticle: (id: string) => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState<ActionState>(null);
  const [pendingActive, setPendingActive] = useState<Record<string, boolean>>({});
  const data = useMemo(() => ({ items, offers }), [items, offers]);
  const drafts = useMemo(() => new Map(offers.map((o) => [o.id, toDraft(o)])), [offers]);

  const opened = openId && openId !== NEW_OFFER ? offers.find((o) => o.id === openId) : null;
  if (openId === NEW_OFFER || opened) {
    return (
      <OfferBuilder
        key={openId}
        offer={opened ?? null}
        offers={offers}
        items={items}
        canManage={canManage}
        nextPosition={offers.length + 1}
        onBack={() => onOpen(null)}
        onSaved={(message, created) => {
          setNotice({ ok: true, message, at: Date.now() });
          if (created) {
            onOpen(null);
            router.refresh();
          }
        }}
        onOpenArticle={onOpenArticle}
      />
    );
  }

  const toggleActive = (o: Offer) => {
    const next = !(pendingActive[o.id] ?? o.active);
    setPendingActive((p) => ({ ...p, [o.id]: next }));
    startTransition(async () => {
      const result = await setOfferActive(o.id, next);
      setNotice(result);
      setPendingActive((p) => {
        const { [o.id]: _gone, ...rest } = p;
        return rest;
      });
      if (result?.ok) router.refresh();
    });
  };

  const web = offers.filter((o) => o.billing === 'ponctuel');
  const recurring = offers.filter((o) => o.billing !== 'ponctuel');
  const card = (o: Offer) => {
    const draft = drafts.get(o.id)!;
    const active = pendingActive[o.id] ?? o.active;
    return (
      <OfferCard
        key={o.id}
        draft={active === draft.active ? draft : { ...draft, active }}
        data={data}
        activeSubscriptions={o.activeSubscriptions}
        interactive={canManage}
        onToggleActive={() => toggleActive(o)}
        onEdit={() => onOpen(o.id)}
      />
    );
  };

  if (offers.length === 0 && items.length === 0) {
    return (
      <div>
        <SectionHead title="Offres" sub="Ce que l'agence vend : des articles assemblés sous un nom et un prix." />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--fg3)', fontSize: '0.8125rem' }}>
          Rien à afficher. Connectez-vous avec un compte rattaché à l&apos;agence pour voir ses offres.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHead
        title="Offres"
        sub={`${offers.length} offre${offers.length > 1 ? 's' : ''} · ${offers.filter((o) => o.active).length} en vente. Une offre décrit le travail qu'elle engage : la vendre crée ses tâches.`}
        action={
          <button
            className={canManage ? 'btn-pri' : 'btn-out'}
            type="button"
            disabled={!canManage}
            title={canManage ? undefined : 'Verrouillé — droit « Gérer le catalogue » requis'}
            onClick={() => onOpen(NEW_OFFER)}
          >
            {canManage ? <IcoPlus size={12} /> : <IcoLock size={12} />}
            Nouvelle offre
          </button>
        }
      />
      {!canManage && (
        <Notice tone="warn">
          Vous consultez les offres en lecture seule — utile pour vendre. Le droit « Gérer le catalogue » est requis pour les modifier.
        </Notice>
      )}
      <Notice state={notice} />
      {web.length > 0 && (
        <>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 10 }}>Forfaits web — paiement unique</div>
          <div className="off-grid" style={{ marginBottom: 24 }}>{web.map(card)}</div>
        </>
      )}
      {recurring.length > 0 && (
        <>
          <div style={{ fontSize: '0.8125rem', fontWeight: 800, marginBottom: 10 }}>Packs récurrents — SEO et maintenance</div>
          <div className="off-grid">{recurring.map(card)}</div>
        </>
      )}
    </div>
  );
}
