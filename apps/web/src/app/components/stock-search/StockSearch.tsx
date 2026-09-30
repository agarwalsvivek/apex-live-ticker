import { useEffect, useMemo, useRef, useState } from 'react';
import './search.css';

// empty locally (Vite proxies /api); the S3 deploy sets VITE_API_BASE_URL at build time
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const SEARCH_URL = `${API_BASE_URL}/api/search?query=`;

type SearchResult = {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
};

function debounce<T extends (...agrs: any[]) => void>(fn: T, delay = 400) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function debounced(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.cancle = () => clearTimeout(timer);

  return debounced;
}

const StockSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useMemo(
    () =>
      debounce(async (text: string) => {
        // drop the previous in-flight request so stale results never win
        abortRef.current?.abort();

        if (!text) {
          setResults([]);
          setLoading(false);
          return;
        }

        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const res = await fetch(SEARCH_URL + encodeURIComponent(text), {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error(`Search failed (${res.status})`);

          const json = await res.json();
          // accept a bare array or one wrapped in { results } / { data }
          setResults(
            Array.isArray(json) ? json : (json.results ?? json.data ?? []),
          );
          setError(null);
        } catch (e) {
          if ((e as Error).name === 'AbortError') return;
          setResults([]);
          setError((e as Error).message);
        } finally {
          if (abortRef.current === controller) setLoading(false);
        }
      }),
    [],
  );

  useEffect(
    () => () => {
      search.cancle();
      abortRef.current?.abort();
    },
    [search],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setOpen(true);
    setLoading(Boolean(text.trim()));
    search(text.trim());
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <section className="parent">
      <form className="container" onSubmit={(e) => e.preventDefault()}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m21 21-4.34-4.34"></path>
          <circle cx="11" cy="11" r="8"></circle>
        </svg>

        <input
          type="text"
          placeholder="Search by ticker or company name..."
          value={query}
          onChange={onChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        />
      </form>

      {showDropdown && (
        <ul className="dropdown" role="listbox">
          {loading && <li className="dropdown-status">Searching...</li>}
          {!loading && error && <li className="dropdown-status">{error}</li>}
          {!loading && !error && results.length === 0 && (
            <li className="dropdown-status">No matches</li>
          )}
          {!loading &&
            !error &&
            results.map(({ ticker, name, exchange }) => (
              <li
                key={`${exchange}:${ticker}`}
                className="dropdown-item"
                role="option"
                aria-selected={false}
                // mousedown fires before the input's blur, so the click registers
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(ticker);
                  setOpen(false);
                }}
              >
                <span className="dropdown-symbol">{ticker}</span>
                <span className="dropdown-name">{name}</span>
                <span className="dropdown-exchange">{exchange}</span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
};

export default StockSearch;
