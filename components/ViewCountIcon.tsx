export function ViewCountIcon({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12C5.2 8.5 8.2 6.5 12 6.5C15.8 6.5 18.8 8.5 21 12C18.8 15.5 15.8 17.5 12 17.5C8.2 17.5 5.2 15.5 3 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.5C13.4 14.5 14.5 13.4 14.5 12C14.5 10.6 13.4 9.5 12 9.5C10.6 9.5 9.5 10.6 9.5 12C9.5 13.4 10.6 14.5 12 14.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
