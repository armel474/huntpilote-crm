'use client';

/**
 * Une zone de dépôt d'image — le logo de l'agence, la photo d'un membre.
 *
 * Le fichier part directement du navigateur vers Supabase Storage (seau
 * `public-assets`, dossier de l'agence, sous RLS), et l'adresse publique
 * obtenue s'écrit dans un champ caché du formulaire qui l'entoure : c'est
 * l'action serveur du formulaire qui l'enregistre, avec ses droits. Sans
 * base configurée, la zone dit qu'elle ne peut rien téléverser.
 */
import { useId, useRef, useState } from 'react';
import { IcoCamera, IcoWarn } from '@/components/ui/Icons';
import { supabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

const BUCKET = 'public-assets';
const MAX_BYTES = 2 * 1024 * 1024;

type Kind = 'logo' | 'photo';

const ACCEPT: Record<Kind, string[]> = {
  logo: ['image/png', 'image/svg+xml'],
  photo: ['image/png', 'image/jpeg', 'image/webp'],
};

const CONSTRAINT: Record<Kind, string> = {
  logo: 'PNG ou SVG, carré, 512 px — 2 Mo au plus',
  photo: 'PNG, JPG ou WebP, image carrée recommandée — 2 Mo au plus',
};

type State = 'empty' | 'uploading' | 'uploaded' | 'rejected';

export function UploadZone({
  name,
  value,
  kind,
  folder,
  disabled,
  shape = 'rounded',
  size = 64,
  requireSquare,
}: {
  /** Le champ caché qui porte l'adresse pour l'action serveur. */
  name: string;
  value: string | null;
  kind: Kind;
  /** Le dossier de destination : `<agence>` ou `<agence>/membres`. */
  folder: string;
  disabled?: boolean;
  shape?: 'rounded' | 'circle';
  size?: number;
  requireSquare?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(value);
  const [state, setState] = useState<State>(value ? 'uploaded' : 'empty');
  const [err, setErr] = useState('');
  const configured = supabaseConfigured();

  const reject = (message: string) => {
    setState(url ? 'uploaded' : 'empty');
    setErr(message);
  };

  const readSquare = (file: File) =>
    new Promise<boolean>((resolve) => {
      if (file.type === 'image/svg+xml') return resolve(true);
      const img = new Image();
      const src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(src);
        resolve(Math.abs(img.width - img.height) <= img.width * 0.08);
      };
      img.onerror = () => {
        URL.revokeObjectURL(src);
        resolve(false);
      };
      img.src = src;
    });

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;
    setErr('');
    if (!configured) return reject('Le stockage n’est pas configuré sur cet environnement.');
    if (!ACCEPT[kind].includes(file.type)) {
      return reject(kind === 'logo' ? 'Format non reconnu — PNG ou SVG seulement.' : 'Format non reconnu — PNG, JPG ou WebP.');
    }
    if (file.size > MAX_BYTES) return reject('Fichier trop lourd — 2 Mo au plus.');
    if (requireSquare && !(await readSquare(file))) {
      return reject('Une image carrée s’affiche mieux — recadrez et reprenez le dépôt.');
    }

    setState('uploading');
    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${folder}/${kind}-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: true });
    if (error) {
      return reject(
        /row-level security|policy|permission/i.test(error.message)
          ? 'Le dépôt a été refusé : connectez-vous avec un compte de l’agence.'
          : `Le téléversement a échoué : ${error.message}`,
      );
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setUrl(data.publicUrl);
    setState('uploaded');
  };

  const radius = shape === 'circle' ? '50%' : 14;
  const canPick = !disabled && state !== 'uploading';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <input type="hidden" name={name} value={url ?? ''} />
      <button
        type="button"
        aria-label={kind === 'logo' ? 'Choisir un logo' : 'Choisir une photo'}
        aria-describedby={`${inputId}-hint`}
        disabled={!canPick}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          cursor: canPick ? 'pointer' : 'default',
          background: state === 'uploaded' ? 'var(--bg-muted)' : 'var(--bg-base)',
          border: err ? '1.5px solid var(--red-b)' : '1.5px dashed var(--bd-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          color: 'var(--fg4)',
        }}
      >
        {state === 'uploaded' && url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : state === 'uploading' ? (
          <span className="ag-spin" aria-hidden="true" />
        ) : err ? (
          <span style={{ color: 'var(--red)', display: 'flex' }}>
            <IcoWarn size={15} />
          </span>
        ) : (
          <IcoCamera size={16} />
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT[kind].join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </button>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: err ? 'var(--red)' : 'var(--fg2)' }}>
          {err
            ? err
            : state === 'uploading'
              ? 'Téléversement…'
              : state === 'uploaded'
                ? 'Image en place'
                : disabled
                  ? 'Aucun fichier'
                  : 'Glissez une image ou cliquez pour choisir'}
        </div>
        <div id={`${inputId}-hint`} style={{ fontSize: '0.6875rem', color: 'var(--fg4)', marginTop: 2 }}>
          {CONSTRAINT[kind]}
        </div>
        {state === 'uploaded' && !disabled && (
          <button
            type="button"
            className="btn-out"
            style={{ marginTop: 6, padding: '0.25rem 0.7rem', fontSize: '0.625rem' }}
            onClick={() => {
              setUrl(null);
              setState('empty');
              setErr('');
            }}
          >
            Retirer
          </button>
        )}
      </div>
    </div>
  );
}
