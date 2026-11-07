/** Plain GET form so search works without JavaScript and keeps the header static. */
export function SearchBox({ defaultValue, autoFocus }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/browse" role="search" className="relative w-full max-w-md">
      <label htmlFor="site-search" className="sr-only">
        Search DHIVE
      </label>
      <svg
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
        />
      </svg>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search chatbots, templates, courses…"
        className="h-10 w-full rounded-lg border border-line bg-wash pr-3 pl-9 text-sm placeholder:text-ink-soft/70 focus:border-brand focus:bg-paper focus:outline-none"
      />
    </form>
  );
}
