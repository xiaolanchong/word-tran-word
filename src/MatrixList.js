import React, { useEffect, useState } from "react";
import { getUser } from "./User.js";
import "flag-icons/css/flag-icons.min.css";

const LANGUAGE_NAMES = {
  en: ["English", 'us'],
  zh: ["Chinese", 'cn'],
  'zh-hans': ["Chinese Simplified", 'cn'],
  'zh-hant': ["Chinese Traditional", 'tw'],
  ja: ["Japanese", 'jp'],
  ko: ["Korean", 'kr'],
  sl: ["Slovene", 'si'],
};

const UNKNOWN_COUNTRY = ["Unknown", 'xx']

const getFlagIcon = (code) => {
  code = code.toLowerCase()
  const country = (LANGUAGE_NAMES[code] || UNKNOWN_COUNTRY)[1]
  return <span className={`fi fi-${country}`} style={{ marginRight: 6 }}></span>;
};

const getLanguageName = (code) => {
  code = code.toLowerCase()
  return (LANGUAGE_NAMES[code] || UNKNOWN_COUNTRY)[0]
};

export function MatrixList() {
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    async function load() {
      const d = await getUser().getDeckList();
      setDecks(d);
    }
    load();
  }, []);

  // group by language
  const grouped = {};
  decks.forEach((deck) => {
    const lang = deck.language || "unknown";
    if (!grouped[lang]) grouped[lang] = [];
    grouped[lang].push(deck);
  });

  return (
    <div className="container mt-4">
      <h1>Все списки для повторения</h1>

      <div className="accordion" id="langAccordion">
        {Object.entries(grouped).map(([lang, items], index) => {
          const langName = getLanguageName(lang);
          const headerId = `heading-${index}`;
          const collapseId = `collapse-${index}`;

          return (
            <div className="accordion-item" key={lang}>
              <h2 className="accordion-header" id={headerId}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                >
                  {getFlagIcon(lang)} {lang.toUpperCase()} — {langName} ({items.length})
                </button>
              </h2>

              <div
                id={collapseId}
                className="accordion-collapse collapse"
                data-bs-parent="#langAccordion"
              >
                <div className="accordion-body">
                  <table className="table table-dark table-striped">
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Описание</th>
                        <th>Язык</th>
                        <th>Кол-во</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((deck) => (
                        <tr key={deck.id}>
                          <td>
                            <a
                              href={`${process.env.PUBLIC_URL}?mode=deck&id=${deck.id}`}
                              className="text-light"
                            >
                              {deck.name}
                            </a>
                          </td>
                          <td>{deck.description ?? ""}</td>
                          <td>{deck.language}</td>
                          <td className="text-end">
                            {deck.rowNumber ?? "?"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}