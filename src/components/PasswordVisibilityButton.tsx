type PasswordVisibilityButtonProps = {
  visible: boolean;
  onToggle: () => void;
};

export function PasswordVisibilityButton({
  visible,
  onToggle,
}: PasswordVisibilityButtonProps) {
  const label = visible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <button
      type="button"
      className="password-visibility-btn"
      aria-label={label}
      aria-pressed={visible}
      title={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.4 0 9 5.4 9 5.4a15.4 15.4 0 0 1-2.2 2.8M6.6 6.6C4.3 8 3 9.4 3 9.4S6.6 15 12 15c1.2 0 2.3-.3 3.3-.7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12s3.6-5.5 9-5.5S21 12 21 12s-3.6 5.5-9 5.5S3 12 3 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )}
    </button>
  );
}
