export default function Icon({ name, size = 20 }) {
  const paths = {
    home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    expenses: 'M4 6h16M7 3v6m10-6v6M5 10h14v10H5zM8 14h3m2 0h3m-8 3h2m3 0h3',
    savings: 'M4 12c0-4 3-7 8-7 4 0 7 2 8 5 1 0 2 1 2 2v4h-3l-1 3h-4l-1-2H9l-1 2H5l-1-4H2v-3zM8 9h.01',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.57V20H9.3v-.08a1.7 1.7 0 0 0-1.03-1.57A1.7 1.7 0 0 0 6.4 18.7l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 4.6 14.7 1.7 1.7 0 0 0 3 13.7H3v-3h.08a1.7 1.7 0 0 0 1.57-1.03A1.7 1.7 0 0 0 4.3 7.8l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 9.3 4.45V4h5.4v.08a1.7 1.7 0 0 0 1.03 1.57 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 10.3h.08v3H21a1.7 1.7 0 0 0-1.6 1.7z',
    plus: 'M12 5v14M5 12h14',
    arrowUp: 'm7 14 5-5 5 5M12 9v10',
    arrowDown: 'm7 10 5 5 5-5M12 5v10',
    search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z',
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.home} /></svg>
}
