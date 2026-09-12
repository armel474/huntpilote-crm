/**
 * Ce que l'onglet Agence lit dans la base — catalogue, offres, équipe,
 * identité de facturation.
 *
 * Fonctions serveur : elles reçoivent le client de la requête, donc les
 * droits de la personne connectée. Une personne sans agence ne voit rien, et
 * ce n'est pas à ces fonctions de le contourner.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

type Db = SupabaseClient<Database>;

export type CatalogueItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  kind: 'service' | 'produit';
  billing: 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
  unit: string | null;
  priceCents: number | null;
  active: boolean;
};

export type OfferLine = {
  id: string;
  label: string;
  quantity: number;
  /** Une offre incluse, plutôt qu'un article. */
  includedOffer: boolean;
  optionGroup: string | null;
  optionKey: string | null;
};

export type Offer = {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  priceCents: number | null;
  priceIsFrom: boolean;
  billing: 'mensuel' | 'trimestriel' | 'annuel' | 'ponctuel';
  introPriceCents: number | null;
  introPeriods: number | null;
  deliveryWeeksMin: number | null;
  deliveryWeeksMax: number | null;
  freeConsultMinutes: number | null;
  isPopular: boolean;
  active: boolean;
  recommendedOfferId: string | null;
  catalogValueCents: number;
  discountCents: number;
  lines: OfferLine[];
  benefits: string[];
  segments: string[];
  taskTemplates: number;
};

export type Role = Database['public']['Enums']['agency_role'];
export type Permission = Database['public']['Enums']['permission'];

/** Un ajustement nominatif : un droit accordé ou retiré malgré le rôle. */
export type PermissionOverride = {
  permission: Permission;
  granted: boolean;
  reason: string | null;
};

export type Member = {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  initials: string;
  role: Role;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  avatarUrl: string | null;
  startedOn: string | null;
  hourlyRateCents: number | null;
  active: boolean;
  /** Invité mais pas encore connecté. */
  pending: boolean;
  /** Ce que la personne peut réellement faire, rôle et ajustements combinés. */
  permissions: Permission[];
  overrides: PermissionOverride[];
};

export type AgencyProfile = {
  id: string;
  name: string;
  legalName: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  gstNumber: string | null;
  qstNumber: string | null;
};

export type AgencyData = {
  agency: AgencyProfile | null;
  items: CatalogueItem[];
  offers: Offer[];
  members: Member[];
  /** Ce que chaque rôle autorise par défaut — le référentiel du produit. */
  roleDefaults: Record<Role, Permission[]>;
};

const NO_DEFAULTS: Record<Role, Permission[]> = {
  admin: [],
  chef_projet: [],
  specialiste_seo: [],
  redacteur: [],
};

/** Ce que la personne connectée peut faire, d'après la liste des membres. */
export function permissionsOf(members: Member[], memberId: string | null | undefined): Permission[] {
  return members.find((m) => m.id === memberId)?.permissions ?? [];
}

export async function loadAgencyData(db: Db): Promise<AgencyData> {
  const [agency, items, offers, values, lines, benefits, segments, templates, members, effective, overrides, defaults] =
    await Promise.all([
      db.from('agency').select('*').maybeSingle(),
      db.from('catalog_item').select('*').order('position'),
      db.from('offer').select('*').order('position'),
      db.from('offer_value').select('offer_id, catalog_value_cents, discount_cents'),
      db
        .from('offer_line')
        .select(
          'id, offer_id, quantity, position, option_group, option_key, label, included_offer_id, catalog_item:catalog_item_id(name), included:included_offer_id(name)',
        )
        .order('position'),
      db.from('offer_benefit').select('offer_id, position, label').order('position'),
      db.from('offer_segment').select('offer_id, position, label').order('position'),
      db.from('offer_task_template').select('offer_id'),
      db.from('agency_member').select('*').order('created_at'),
      db.from('member_effective_permission').select('member_id, permission'),
      db.from('member_permission').select('member_id, permission, granted, reason'),
      db.from('role_permission').select('role, permission'),
    ]);

  const effectiveBy = new Map<string, Permission[]>();
  for (const e of effective.data ?? []) {
    if (!e.member_id || !e.permission) continue;
    effectiveBy.set(e.member_id, [...(effectiveBy.get(e.member_id) ?? []), e.permission]);
  }
  const overridesBy = new Map<string, PermissionOverride[]>();
  for (const o of overrides.data ?? []) {
    overridesBy.set(o.member_id, [
      ...(overridesBy.get(o.member_id) ?? []),
      { permission: o.permission, granted: o.granted, reason: o.reason },
    ]);
  }
  const roleDefaults: Record<Role, Permission[]> = {
    admin: [],
    chef_projet: [],
    specialiste_seo: [],
    redacteur: [],
  };
  for (const d of defaults.data ?? []) roleDefaults[d.role].push(d.permission);

  const valueByOffer = new Map(
    (values.data ?? []).map((v) => [
      v.offer_id as string,
      { value: Number(v.catalog_value_cents ?? 0), discount: Number(v.discount_cents ?? 0) },
    ]),
  );
  const groupBy = <T extends { offer_id: string | null }>(rows: T[] | null) => {
    const m = new Map<string, T[]>();
    for (const r of rows ?? []) {
      if (!r.offer_id) continue;
      m.set(r.offer_id, [...(m.get(r.offer_id) ?? []), r]);
    }
    return m;
  };
  const linesBy = groupBy(lines.data);
  const benefitsBy = groupBy(benefits.data);
  const segmentsBy = groupBy(segments.data);
  const templatesBy = groupBy(templates.data);

  return {
    agency: agency.data
      ? {
          id: agency.data.id,
          name: agency.data.name,
          legalName: agency.data.legal_name,
          address: agency.data.address,
          city: agency.data.city,
          province: agency.data.province,
          postalCode: agency.data.postal_code,
          phone: agency.data.phone,
          email: agency.data.email,
          website: agency.data.website,
          logoUrl: agency.data.logo_url,
          gstNumber: agency.data.gst_number,
          qstNumber: agency.data.qst_number,
        }
      : null,
    items: (items.data ?? []).map((i) => ({
      id: i.id,
      code: i.code,
      name: i.name,
      description: i.description,
      kind: i.kind,
      billing: i.billing,
      unit: i.unit,
      priceCents: i.price_cents,
      active: i.active,
    })),
    offers: (offers.data ?? []).map((o) => ({
      id: o.id,
      code: o.code,
      name: o.name,
      tagline: o.tagline,
      priceCents: o.price_cents,
      priceIsFrom: o.price_is_from,
      billing: o.billing,
      introPriceCents: o.intro_price_cents,
      introPeriods: o.intro_periods,
      deliveryWeeksMin: o.delivery_weeks_min,
      deliveryWeeksMax: o.delivery_weeks_max,
      freeConsultMinutes: o.free_consult_minutes,
      isPopular: o.is_popular,
      active: o.active,
      recommendedOfferId: o.recommended_offer_id,
      catalogValueCents: valueByOffer.get(o.id)?.value ?? 0,
      discountCents: valueByOffer.get(o.id)?.discount ?? 0,
      lines: (linesBy.get(o.id) ?? []).map((l) => ({
        id: l.id,
        label:
          l.label ??
          (l.included_offer_id
            ? `Tout ce qui est dans « ${l.included?.name ?? '…'} »`
            : (l.catalog_item?.name ?? '')),
        quantity: Number(l.quantity),
        includedOffer: !!l.included_offer_id,
        optionGroup: l.option_group,
        optionKey: l.option_key,
      })),
      benefits: (benefitsBy.get(o.id) ?? []).map((b) => b.label),
      segments: (segmentsBy.get(o.id) ?? []).map((s) => s.label),
      taskTemplates: (templatesBy.get(o.id) ?? []).length,
    })),
    members: (members.data ?? []).map((m) => ({
      id: m.id,
      fullName: m.full_name ?? '',
      firstName: m.first_name,
      lastName: m.last_name,
      initials: m.initials,
      role: m.role,
      jobTitle: m.job_title,
      email: m.email,
      phone: m.phone,
      address: m.address,
      city: m.city,
      province: m.province,
      postalCode: m.postal_code,
      avatarUrl: m.avatar_url,
      startedOn: m.started_on,
      hourlyRateCents: m.hourly_rate_cents,
      active: m.active,
      pending: !m.accepted_at,
      permissions: effectiveBy.get(m.id) ?? [],
      overrides: overridesBy.get(m.id) ?? [],
    })),
    roleDefaults: defaults.data ? roleDefaults : NO_DEFAULTS,
  };
}
