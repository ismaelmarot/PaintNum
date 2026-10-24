import type { ExportManager } from '@/components/ExportActions/useExportManager'
import {
  BusyNote,
  ExportError,
  NameInput,
  PrimaryButton,
  Row,
  SecondaryButton,
} from '@/components/ExportActions/ExportActions.styles'

function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 2.5h7L18.5 8v11.5a2 2 0 0 1-2 2h-10.5a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2Z" />
      <path d="M13 2.5V8h5.5" />
      <path d="M12 11v6.5m0 0-2-2m2 2 2-2" />
    </svg>
  )
}

function ZipIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <path d="M12 2.5v3m0 2.5v3m0 2.5v2" />
      <path d="M9 16.5h6l-3 4.5-3-4.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false" className="spinner">
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  )
}

export interface ExportActionsProps {
  manager: ExportManager
}

/** Acciones de descarga: nombre del archivo + PDF de impresión y ZIP completo. */
export function ExportActions({ manager }: ExportActionsProps) {
  const { canExport, busyKind, error, runExport, filename, setFilename } = manager
  const busy = busyKind !== null

  return (
    <Row>
      <NameInput
        aria-label="Nombre del archivo a descargar"
        placeholder="paintnum"
        value={filename}
        onChange={(event) => setFilename(event.target.value)}
        disabled={busy}
      />
      <PrimaryButton
        type="button"
        disabled={!canExport || busy}
        $busy={busyKind === 'pdf'}
        onClick={() => void runExport('pdf')}
      >
        <PdfIcon />
        Descargar PDF
      </PrimaryButton>
      <SecondaryButton
        type="button"
        disabled={!canExport || busy}
        $busy={busyKind === 'zip'}
        onClick={() => void runExport('zip')}
      >
        <ZipIcon />
        Descargar ZIP
      </SecondaryButton>
      {busyKind && (
        <BusyNote>
          <SpinnerIcon /> Generando archivo…
        </BusyNote>
      )}
      {!busy && error && <ExportError role="alert">{error}</ExportError>}
    </Row>
  )
}
