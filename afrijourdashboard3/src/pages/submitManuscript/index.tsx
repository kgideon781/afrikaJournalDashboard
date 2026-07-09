// import React, { useEffect, useState } from 'react';

// const SubmitManuscripts = () => {
//   const [title, setTitle] = useState('');
//   const [abstract, setAbstract] = useState('');
//   const [authors, setAuthors] = useState('');
//   const [journal, setJournal] = useState('');
//   const [file, setFile] = useState<File | null>(null);

//   const [journals, setJournals] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const getToken = () => {
//     const tokens = localStorage.getItem('authTokens');
//     return tokens ? JSON.parse(tokens).access : null;
//   };

//   useEffect(() => {
//     const fetchJournals = async () => {
//       const token = getToken();

//       const res = await fetch(
//         'http://localhost:8000/journal_api/api/journals/',
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const data = await res.json();
//       setJournals(data);
//     };

//     fetchJournals();
//   }, []);

//   const handleSubmit = async () => {
//     if (!title || !abstract || !authors || !journal || !file) {
//       setMessage('Please fill all fields and attach a file.');
//       return;
//     }

//     setLoading(true);
//     setMessage('');

//     const token = getToken();

//     try {
//       const formData = new FormData();
//       formData.append('title', title);
//       formData.append('abstract', abstract);
//       formData.append('authors', authors);
//       formData.append('journal', journal);
//       formData.append('file', file);

//       const res = await fetch(
//         'http://localhost:8000/journal_api/api/manuscripts/submit/',
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       const data = await res.json();

//       if (res.ok) {
//         setMessage('✅ Manuscript submitted successfully');

//         setTitle('');
//         setAbstract('');
//         setAuthors('');
//         setJournal('');
//         setFile(null);
//       } else {
//         setMessage(data?.error || 'Submission failed');
//       }
//     } catch {
//       setMessage('Network error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-6 bg-gray-50 overflow-y-auto">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">
//           Submit Manuscript
//         </h1>

//         {/* GRID LAYOUT */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

//           {/* LEFT COLUMN */}
//           <div className="space-y-5">

//             <div>
//               <label className="font-medium">Title</label>
//               <input
//                 className="w-full border p-2 rounded mt-1"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Enter manuscript title"
//               />
//             </div>

//             <div>
//               <label className="font-medium">Authors</label>
//               <input
//                 className="w-full border p-2 rounded mt-1"
//                 value={authors}
//                 onChange={(e) => setAuthors(e.target.value)}
//                 placeholder="e.g. John Doe, Jane Smith"
//               />
//             </div>

//             <div>
//               <label className="font-medium">Select Journal</label>
//               <select
//                 className="w-full border p-2 rounded mt-1"
//                 value={journal}
//                 onChange={(e) => setJournal(e.target.value)}
//               >
//                 <option value="">-- Select Journal --</option>
//                 {journals.map((j) => (
//                   <option key={j.id} value={j.id}>
//                     {j.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="font-medium">Upload File</label>
//               <input
//                 type="file"
//                 className="w-full border p-2 rounded mt-1"
//                 onChange={(e) =>
//                   setFile(e.target.files ? e.target.files[0] : null)
//                 }
//               />

//               {file && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Selected: {file.name}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* RIGHT COLUMN */}
//           <div className="space-y-5">

//             <div>
//               <label className="font-medium">Abstract</label>
//               <textarea
//                 className="w-full border p-2 rounded h-72 mt-1"
//                 value={abstract}
//                 onChange={(e) => setAbstract(e.target.value)}
//                 placeholder="Write your abstract..."
//               />
//             </div>

//             {/* SUBMIT AREA */}
//             <div className="pt-2">
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
//               >
//                 {loading ? 'Submitting...' : 'Submit Manuscript'}
//               </button>

//               {message && (
//                 <p className="mt-3 text-sm font-medium">
//                   {message}
//                 </p>
//               )}
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubmitManuscripts;







import { Layout } from '@/components/custom/layout'
import { TopNav } from "@/components/top-nav";
import { UserNav } from "@/components/user-nav";
import { useState, useEffect } from 'react';
import { BASE_URL } from '@/config'
const SubmitManuscripts = () => {
  // User-entered fields
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [authors, setAuthors] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Journal selector state — populated from /journal_api/journals/.
  interface JournalOption { id: number; journal_title: string; approved?: boolean }
  const [journals, setJournals] = useState<JournalOption[]>([]);
  const [journalId, setJournalId] = useState<string>('');
  const [journalsLoading, setJournalsLoading] = useState(true);
  const [journalSearch, setJournalSearch] = useState('');
  const [journalPickerOpen, setJournalPickerOpen] = useState(false);

  useEffect(() => {
    // Fetch all pages in parallel — DRF caps page_size at 100, and there
    // are ~2000 journals, so we discover the total on page 1 and then fire
    // page 2..N concurrently.
    let cancelled = false;
    (async () => {
      try {
        const firstRes = await fetch(
          `${BASE_URL}/journal_api/journals/?page=1&page_size=100`
        );
        if (!firstRes.ok) throw new Error(`HTTP ${firstRes.status}`);
        const first = await firstRes.json();
        const total: number = first.count ?? first.results?.length ?? 0;
        const pageSize = first.results?.length || 100;
        const pageCount = Math.ceil(total / pageSize);
        const rest = await Promise.all(
          Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
            fetch(
              `${BASE_URL}/journal_api/journals/?page=${i + 2}&page_size=${pageSize}`
            )
              .then((r) => (r.ok ? r.json() : { results: [] }))
              .catch(() => ({ results: [] }))
          )
        );
        const all: JournalOption[] = [first, ...rest]
          .flatMap((p: any) => p.results || [])
          .map((j: any) => ({
            id: j.id,
            journal_title: j.journal_title,
            approved: Boolean(j.approved),
          }))
          .filter((j: JournalOption) => j.approved)
          .sort((a: JournalOption, b: JournalOption) =>
            a.journal_title.localeCompare(b.journal_title)
          );
        if (!cancelled) setJournals(all);
      } catch (err) {
        console.error('Failed to load journals list', err);
      } finally {
        if (!cancelled) setJournalsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getToken = () => {
    const tokens = localStorage.getItem('authTokens');

    if (!tokens) return null;

    return JSON.parse(tokens).access;
  };

  const handleSubmit = async () => {
    if (!title || !abstract || !authors || !file || !journalId) {
      setMessage('Please complete all required fields.');
      return;
    }

    const token = getToken();

    if (!token) {
      setMessage('Authentication token not found.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();

      // corresponding_author is read_only on the backend serializer and is
      // filled from request.user, so we only send the fields the user picked.
      formData.append('journal', journalId);

      // User-entered values
      formData.append('title', title);
      formData.append('abstract', abstract);
      formData.append('authors', authors);
      formData.append('file', file);

      const response = await fetch(
         `${BASE_URL}/journal_api/api/manuscripts/submit/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Manuscript submitted successfully.');

        setTitle('');
        setAbstract('');
        setAuthors('');
        setFile(null);
      } else {
        setMessage(
          data.detail ||
          data.error ||
          JSON.stringify(data)
        );
      }
    } catch (error) {
      console.error(error);
      setMessage('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const topNav = [
  {
    title: " ",
    href: " ",
    isActive: true,
  },
];

  return (
    <Layout>
<Layout.Body>
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6 max-w-6xl mx-auto">

        <h2 className="text-2xl font-bold mb-6">
          Submit Manuscript
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-4">

            <div>
              <label className="block font-medium mb-1">
                Journal
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => {
                    setJournalSearch(e.target.value);
                    setJournalId('');
                    setJournalPickerOpen(true);
                  }}
                  onFocus={() => setJournalPickerOpen(true)}
                  onBlur={() =>
                    // slight delay so click on an option registers first
                    setTimeout(() => setJournalPickerOpen(false), 150)
                  }
                  placeholder={
                    journalsLoading
                      ? 'Loading approved journals…'
                      : 'Start typing to search…'
                  }
                  disabled={journalsLoading}
                  className="w-full border rounded p-3 bg-white disabled:bg-gray-100"
                  autoComplete="off"
                />
                {journalPickerOpen && !journalsLoading && (
                  <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded border bg-white shadow">
                    {(() => {
                      const q = journalSearch.trim().toLowerCase();
                      const filtered = q
                        ? journals.filter((j) =>
                            j.journal_title.toLowerCase().includes(q)
                          )
                        : journals;
                      if (filtered.length === 0) {
                        return (
                          <li className="p-3 text-sm text-gray-500">
                            No matching journals.
                          </li>
                        );
                      }
                      return filtered.slice(0, 100).map((j) => (
                        <li
                          key={j.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setJournalId(String(j.id));
                            setJournalSearch(j.journal_title);
                            setJournalPickerOpen(false);
                          }}
                          className={
                            'cursor-pointer p-2 hover:bg-gray-100 ' +
                            (String(j.id) === journalId ? 'bg-blue-50' : '')
                          }
                        >
                          {j.journal_title}
                        </li>
                      ));
                    })()}
                  </ul>
                )}
                {journalId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected journal id: {journalId}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Manuscript Title
              </label>

              <input
                className="w-full border rounded p-3"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter title"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Authors
              </label>

              <input
                className="w-full border rounded p-3"
                value={authors}
                onChange={(e) =>
                  setAuthors(e.target.value)
                }
                placeholder="John Doe, Jane Smith"
              />
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            <div>
              <label className="block font-medium mb-1">
                Abstract
              </label>

              <textarea
                className="w-full border rounded p-3 h-56"
                value={abstract}
                onChange={(e) =>
                  setAbstract(e.target.value)
                }
                placeholder="Write abstract..."
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Manuscript File
              </label>

              <input
                type="file"
                className="w-full border rounded p-3"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
              />

              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
              {loading
                ? 'Submitting...'
                : 'Submit Manuscript'}
            </button>

            {message && (
              <div className="p-3 rounded bg-gray-100">
                {message}
              </div>
            )}

          </div>

        </div>
      </div>
    </div> </Layout.Body>
    </Layout>
  );
};

export default SubmitManuscripts;