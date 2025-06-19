import { useState, useEffect } from "react";
import FloatingCopyButton from "./FloatingCopyButton";
import Confetti from "./Confetti";
import clublogo from "./assets/clublogo.png";

// ------- DATA
const playerList = [
  "Jerome Belpaeme", "Leon Boone", "Wolf Cappan", "Leon De Backer", "Mateo De Tremerie",
  "Nicolas Desaver", "Mauro Dewitte", "Aron D'Hoore", "Ferran Dhuyvetter", "Arthur Germonpré", 
  "Lander Helderweirt", "Tuur Heyerick", "Jef Lambers", "Andro Martens", "Lukas Onderbeke",
  "Siebe Passchyn", "Viktor Poelman", "Lav Rajkovic", "Moussa Sabir", "Mauro Savat", 
  "Mattias Smet", "Guillaume Telleir", "Otis Vanbiervliet", "Michiel Van Melkebeke", "Rube Verhille",
  "Filemon Verstraete"
];
const jerseyNumbers = Array.from({ length: 25 }, (_, i) => (i + 1).toString());
const nonSelectionReasons = [
  "Geblesseerd", "Ziek", "Afwezig", "Rust", "Op vakantie",
  "GU15", "Stand-by GU15", "1x getraind", "Schoolverplichtingen",
  "Te laat afgemeld/niet verwittigd", "Geschorst", "Andere reden"
];
const days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

export default function App() {
  // STATES
  const [day, setDay] = useState("");
  const [matchType, setMatchType] = useState("Thuiswedstrijd");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [opponent, setOpponent] = useState("");
  const [field, setField] = useState("");
  const [address, setAddress] = useState("");
  const [gatheringPlace, setGatheringPlace] = useState("");
  const [customGatheringPlace, setCustomGatheringPlace] = useState(false);
  const [gatheringTime, setGatheringTime] = useState("");
  const [arrivalTimeOpponent, setArrivalTimeOpponent] = useState("");
  const [responsible, setResponsible] = useState("");
  const [remark, setRemark] = useState("Vergeet jullie ID niet mee te nemen!");
  const [preview, setPreview] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, string>>({});
  const [nonSelectedReasons, setNonSelectedReasons] = useState<Record<string, string>>({});
  const [nonSelectedComments, setNonSelectedComments] = useState<Record<string, string>>({});
  const [searchSelect, setSearchSelect] = useState("");
  const [searchRugnummer, setSearchRugnummer] = useState("");
  const [showSelection, setShowSelection] = useState(true);
  const [showNotSelected, setShowNotSelected] = useState(true);

  // Automatische verzamelplaats
  useEffect(() => {
    if (!customGatheringPlace) {
      if (matchType === "Uitwedstrijd") {
        if (!gatheringPlace || gatheringPlace.trim().toLowerCase().includes("kleedkamer")) {
          setGatheringPlace("Parking KVE");
        }
      } else {
        if (!gatheringPlace || gatheringPlace.trim().toLowerCase().includes("parking")) {
          setGatheringPlace("Kleedkamer X");
        }
      }
    }
  }, [matchType, customGatheringPlace]);

  // --------- SELECTIE LOGICA ---------
  const allNotSelected = playerList.filter(p => !(p in selectedPlayers));
  let sortedNotSelected = [...allNotSelected];
  if (searchSelect.trim()) {
    const top = sortedNotSelected.filter(p => p.toLowerCase().includes(searchSelect.toLowerCase()));
    const rest = sortedNotSelected.filter(p => !p.toLowerCase().includes(searchSelect.toLowerCase()));
    sortedNotSelected = [...top, ...rest];
  }
  const selected = Object.keys(selectedPlayers).sort(
    (a, b) => Number(selectedPlayers[a]) - Number(selectedPlayers[b])
  );
  const usedNumbers = new Set(Object.values(selectedPlayers).filter(Boolean));
  const alleRugnummersUniek =
    selected.length === new Set(Object.values(selectedPlayers).filter(Boolean)).size
    && !selected.some(p => !selectedPlayers[p]);
  const maxSpelers = 15;

  function handleSelect(player: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: "" }));
    setNonSelectedReasons(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setNonSelectedComments(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
    setSearchSelect("");
  }
  function removeSelected(player: string) {
    setSelectedPlayers(prev => {
      const updated = { ...prev };
      delete updated[player];
      return updated;
    });
  }
  function handleRugnummer(player: string, nummer: string) {
    setSelectedPlayers(prev => ({ ...prev, [player]: nummer }));
  }
  function handleNonSelectedReason(player: string, reason: string) {
    setNonSelectedReasons(prev => ({ ...prev, [player]: reason }));
  }
  function handleNonSelectedComment(player: string, comment: string) {
    setNonSelectedComments(prev => ({ ...prev, [player]: comment }));
  }
  function handleResponsible(player: string) {
    setResponsible(player);
  }
  function autoToewijzen() {
    let vrijeNummers = jerseyNumbers.filter(n => !Object.values(selectedPlayers).includes(n));
    let i = 0;
    setSelectedPlayers(prev => {
      const nieuw = {...prev};
      for (let p of Object.keys(nieuw)) {
        if (!nieuw[p] && vrijeNummers[i]) nieuw[p] = vrijeNummers[i++];
      }
      return nieuw;
    });
  }
  // ---------- KOPIEER + KONFETTI ----------
  const copyToClipboard = async () => {
    const el = document.querySelector("#mailpreview-only");
    if (el && navigator.clipboard && window.ClipboardItem) {
      const html = el.innerHTML;
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }) }),
      ]);
      setSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setSuccess(false), 1200);
      setTimeout(() => setShowConfetti(false), 5000);
    } else {
      alert("Kopiëren niet ondersteund in deze browser.");
    }
  };

  // -------- GENERATE EMAIL & LIVE PREVIEW --------
  function generateEmail() {
    if (!day || !date || !time || !opponent) {
      setPreview(`<div style="padding:16px;text-align:center;color:#a00;">Vul dag, datum, tijd en tegenstander in.</div>`);
      return;
    }
    // Themekleur afhankelijk van matchtype
    const hoofdKleur = matchType === "Uitwedstrijd"
      ? "#1679bc"
      : "#142c54";

    // Details in correcte volgorde (en logica)
    let detailsRows = `
      <tr><td style="font-weight:600;width:175px;">Dag:</td><td><strong>${day}</strong></td></tr>
      <tr><td style="font-weight:600;">Type wedstrijd:</td><td><strong>${matchType}</strong></td></tr>
      <tr><td style="font-weight:600;">Datum:</td><td><strong>${date}</strong></td></tr>
      <tr><td style="font-weight:600;">Start wedstrijd:</td><td><strong>${time}</strong></td></tr>
      <tr><td style="font-weight:600;">Tegenstander:</td><td><strong>${opponent}</strong></td></tr>
      <tr><td style="font-weight:600;">Terrein:</td><td>${field}</td></tr>
    `;
    if (matchType === "Uitwedstrijd") {
      detailsRows += `
        <tr><td style="font-weight:600;">Adres:</td><td>${address}</td></tr>
        ${arrivalTimeOpponent ? `<tr><td style="font-weight:600;">Aankomst tegenstander:</td><td><strong>${arrivalTimeOpponent} (${opponent})</strong></td></tr>` : ""}
        <tr><td style="font-weight:600;">Verzamelen:</td><td><strong>${gatheringTime}</strong> aan <strong>${gatheringPlace}</strong></td></tr>
      `;
    } else {
      detailsRows += `
        <tr><td style="font-weight:600;">Verzamelen:</td><td><strong>${gatheringTime}</strong> aan <strong>${gatheringPlace}</strong></td></tr>
      `;
    }

    const carpoolText = matchType === "Uitwedstrijd"
      ? `<div style="margin-top:10px;background:#e8f4fc;padding:10px;border-radius:6px;border:1px solid #c0e6fa;">
          <strong>Carpool:</strong> We vragen om samen te vertrekken vanaf de parking van KVE Drongen. Dit versterkt de teamgeest en biedt de mogelijkheid om te carpoolen. Voor ouders voor wie dit een omweg is van meer dan 15 minuten, is het toegestaan om rechtstreeks te rijden. Laat dit wel weten via de WhatsApp-poll.
        </div>` : "";

    const selectionTableRows = selected.map(player => `
      <tr style="${responsible === player ? 'background:#e6ffe6;box-shadow:0 0 0 2px #39f7;filter:drop-shadow(0 0 6px #80ee90);' : ''}">
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">#${selectedPlayers[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #e0e0e0;text-align:center;">
          ${responsible === player ? "✅ Verantwoordelijk voor was, fruit & chocomelk" : ""}
        </td>
      </tr>
    `).join("");

    const nonSelectedTableRows = allNotSelected.map(player => `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${player}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedReasons[player] || "-"}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #ffe2e2;">${nonSelectedComments[player] || ""}</td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family:sans-serif;line-height:1.6;max-width:640px;margin:auto;background:#fff;color:#222;border-radius:16px;box-shadow:0 8px 32px #284cff11;">
        <div style="background:${hoofdKleur};border-radius:16px 16px 0 0;padding:18px 28px 14px 28px;margin-bottom:20px; color:#fff;display:flex;align-items:center;">
          <img src="https://i.imgur.com/cgvdj96.png" alt="logo" style="height:48px;margin-right:18px;border-radius:13px;box-shadow:0 1px 7px #0003"/>
          <div>
            <div style="font-size:1.22em;font-weight:700;letter-spacing:1px;">KVE Drongen</div>
            <div style="font-size:1.05em;font-weight:400;opacity:0.97;">Wedstrijddetails & selectie</div>
          </div>
        </div>
        <div style="background:#e7effb;border-radius:11px;padding:16px 22px 10px 22px;margin-bottom:20px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:${hoofdKleur};">Wedstrijddetails</h2>
          <table style="width:100%;border-collapse:collapse;">
            ${detailsRows}
          </table>
          ${carpoolText}
        </div>
        <div style="background:#f1ffe9;border-radius:11px;padding:15px 22px;margin-bottom:16px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:#178530;">Selectie</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#d1f7b3;">
                <th style="text-align:left;padding:6px 12px;">Rugnummer</th>
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Verantwoordelijk</th>
              </tr>
            </thead>
            <tbody>${selectionTableRows}</tbody>
          </table>
        </div>
        <div style="background:#fff7f7;border-radius:11px;padding:15px 22px;margin-bottom:14px;">
          <h2 style="margin:0 0 8px 0;font-size:1.08em;font-weight:700;color:#e66472;">Niet geselecteerd</h2>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#ffd7d7;">
                <th style="text-align:left;padding:6px 12px;">Naam speler</th>
                <th style="text-align:left;padding:6px 12px;">Reden</th>
                <th style="text-align:left;padding:6px 12px;">Opmerking</th>
              </tr>
            </thead>
            <tbody>${nonSelectedTableRows}</tbody>
          </table>
        </div>
        <div style="background:#fffbe6;border-radius:8px;padding:14px 18px;">
          <p style="margin:0;"><strong>Opmerking:</strong> ${remark}</p>
        </div>
        <br/><br/>
        <p style="margin-top:34px;margin-bottom:6px;">Sportieve groeten,</p>
        <p style="margin:0;font-weight:600;">Yannick Deraedt<br/>Trainer U15 IP – KVE Drongen</p>
      </div>
    `;
    setPreview(html);
  }

  useEffect(() => {
    generateEmail();
    // eslint-disable-next-line
  }, [
    day, matchType, date, time, opponent, field, address, gatheringPlace, customGatheringPlace, gatheringTime,
    arrivalTimeOpponent, responsible, remark, selectedPlayers, nonSelectedReasons, nonSelectedComments
  ]);

  // --------- EASTER EGG: Squad complete! ----------
  useEffect(() => {
    if (selected.length === 15) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [selected.length]);

  // --------- RENDER ---------
  return (
    <>
      {/* Clublogo als watermerk/canvas, met subtiele fade-animatie */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100vw", height: "100vh",
          zIndex: 0,
          background: `url(${clublogo}) center center no-repeat`,
          backgroundSize: "56vw",
          opacity: 0.14,
          animation: "watermark-fade 7s ease-in-out infinite alternate",
          pointerEvents: "none"
        }}
      />
      {/* Confetti */}
      <Confetti active={showConfetti} duration={5000} />
      <div className="flex flex-col md:flex-row gap-4 w-full p-0 m-0" style={{ position: "relative", zIndex: 1 }}>
        {/* LINKERDEEL: INPUT */}
        <div className="w-full md:w-1/2 p-3 md:pl-8 pt-6 md:pt-12 flex flex-col">
          <div className="flex items-center mb-4" style={{ position: "relative", zIndex: 2 }}>
            <img src={clublogo} alt="clublogo" style={{
              height: 54, marginRight: 16, borderRadius: 14, boxShadow: "0 1px 8px #2166aa55"
            }} />
            <span style={{
              fontSize: "2.1rem", fontWeight: 900, letterSpacing: "1.5px", color: "#142c54",
              textShadow: "0 1px 16px #fff7, 0 1px 2px #0d183799", padding: "2px 7px", borderRadius: "8px"
            }}>
              E-mail Generator – KVE Drongen
            </span>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow mb-6">
            <ul className="space-y-4">
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Dag <span className="text-red-500">*</span></label>
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-2 rounded text-black">
                  <option value="">Kies een dag</option>
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Type wedstrijd <span className="text-red-500">*</span></label>
                <select value={matchType} onChange={e => setMatchType(e.target.value)} className="w-full p-2 rounded text-black">
                  <option>Thuiswedstrijd</option>
                  <option>Uitwedstrijd</option>
                </select>
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Datum <span className="text-red-500">*</span></label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Start wedstrijd <span className="text-red-500">*</span></label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Tegenstander <span className="text-red-500">*</span></label>
                <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Terrein</label>
                <input type="text" value={field} onChange={e => setField(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              {matchType === "Uitwedstrijd" && (
                <>
                  <li>
                    <label className="block font-semibold mb-1 text-blue-800">Adres</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded text-black" />
                  </li>
                  <li>
                    <label className="block font-semibold mb-1 text-blue-800">Aankomstuur bij tegenstander</label>
                    <input type="time" value={arrivalTimeOpponent} onChange={e => setArrivalTimeOpponent(e.target.value)} className="w-full p-2 rounded text-black" />
                  </li>
                </>
              )}
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Verzameltijd</label>
                <input type="time" value={gatheringTime} onChange={e => setGatheringTime(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Verzamelplaats</label>
                {!customGatheringPlace ? (
                  <select
                    value={gatheringPlace}
                    onChange={e => {
                      if (e.target.value === "__custom") setCustomGatheringPlace(true);
                      else setGatheringPlace(e.target.value);
                    }}
                    className="w-full p-2 rounded text-black"
                  >
                    <option value="">Kies verzamelplaats</option>
                    <option value="Kleedkamer X">Kleedkamer X</option>
                    <option value="Parking KVE">Parking KVE</option>
                    <option value="__custom">Andere (manueel invullen)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={gatheringPlace}
                    onChange={e => setGatheringPlace(e.target.value)}
                    className="w-full p-2 rounded text-black"
                    placeholder="Geef verzamelplaats op"
                    onBlur={() => { if (!gatheringPlace) setCustomGatheringPlace(false); }}
                  />
                )}
              </li>
              <li>
                <label className="block font-semibold mb-1 text-blue-800">Opmerking (algemeen)</label>
                <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full p-2 rounded text-black" />
              </li>
            </ul>
          </div>
          <div className="mb-2 text-lg text-blue-900">
            Geselecteerd: <span className="font-bold">{selected.length}</span> / {playerList.length}
            {selected.length > maxSpelers &&
              <span className="ml-2 px-2 py-1 rounded bg-yellow-300 text-yellow-900 font-bold animate-bounce">⚠️ Meer dan 15 geselecteerd!</span>
            }
          </div>
          {selected.length > 0 && (
            <div className={`mb-2 px-2 py-1 rounded font-bold 
              ${alleRugnummersUniek 
              ? 'bg-green-200 text-green-900' 
              : 'bg-red-200 text-red-900 animate-pulse'}`}>
              {alleRugnummersUniek
                ? '✅ Alle rugnummers zijn uniek'
                : '❌ Er zijn dubbele of ontbrekende rugnummers'}
            </div>
          )}
          <button className="font-bold mb-2 px-2 py-1 bg-blue-700 hover:bg-blue-900 rounded text-white transition-all"
            onClick={() => setShowSelection(s => !s)}>
            {showSelection ? "▼" : "►"} Selectie ({selected.length})
          </button>
          {showSelection && (
          <div className="mb-6">
            <div className="mb-2 flex flex-col md:flex-row gap-2 items-center">
              <input
                type="text"
                className="p-2 rounded text-black w-40"
                placeholder="Zoek rugnummer..."
                value={searchRugnummer}
                onChange={e => setSearchRugnummer(e.target.value)}
              />
              <button
                onClick={autoToewijzen}
                className="bg-blue-600 text-white px-3 py-2 rounded ml-2 font-bold hover:bg-blue-900 transition-all"
              >
                Vul rugnummers op volgorde
              </button>
            </div>
            <div className="rounded-xl bg-green-50 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Selectie</th>
                    <th className="p-2 text-left">Rugnummer</th>
                    <th className="p-2 text-left">Naam speler</th>
                    <th className="p-2 text-left">Verantwoordelijk</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selected
                    .filter(player => !searchRugnummer.trim() || (selectedPlayers[player] && selectedPlayers[player].includes(searchRugnummer)))
                    .map(player => (
                    <tr key={player} className={`transition-all ${responsible === player ? "bg-green-200" : "hover:bg-green-100"}`}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-6 h-6"
                          checked={true}
                          onChange={() => removeSelected(player)}
                          aria-label={`Verwijder ${player} uit selectie`}
                        />
                      </td>
                      <td className="p-2">
                        <select className="w-14 text-black" value={selectedPlayers[player]} onChange={e => handleRugnummer(player, e.target.value)}>
                          <option value="">--</option>
                          {jerseyNumbers.map(n => (
                            <option key={n} value={n} disabled={usedNumbers.has(n) && selectedPlayers[player] !== n}>{n}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">{player}</td>
                      <td className="p-2 text-center">
                        <input
                          type="radio"
                          name="verantwoordelijke"
                          checked={responsible === player}
                          onChange={() => handleResponsible(player)}
                        />
                        {responsible === player && (
                          <span className="ml-2">✅ Verantwoordelijk voor was, fruit & chocomelk</span>
                        )}
                      </td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
          <button className="font-bold mb-2 px-2 py-1 bg-red-700 hover:bg-red-900 rounded text-white transition-all"
            onClick={() => setShowNotSelected(s => !s)}>
            {showNotSelected ? "▼" : "►"} Niet-geselecteerden ({sortedNotSelected.length})
          </button>
          {showNotSelected && (
          <div className="mb-10">
            <div className="font-semibold mb-1 text-blue-900">Zoek en selecteer spelers</div>
            <input
              type="text"
              placeholder="Zoek speler..."
              value={searchSelect}
              onChange={e => setSearchSelect(e.target.value)}
              className="p-2 rounded text-black w-full mb-2"
              autoComplete="off"
            />
            <div className="rounded-xl bg-red-50 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Selecteer</th>
                    <th className="p-2 text-left">Naam speler</th>
                    <th className="p-2 text-left">Reden niet geselecteerd & Opmerking</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedNotSelected.map(player => (
                    <tr key={player}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          className="w-6 h-6"
                          checked={false}
                          onChange={() => handleSelect(player)}
                          aria-label={`Selecteer ${player}`}
                        />
                      </td>
                      <td className="p-2">
                        <span className={player.toLowerCase().includes(searchSelect.toLowerCase()) && searchSelect ? "bg-yellow-200 px-1 rounded" : ""}>
                          {player}
                        </span>
                      </td>
                      <td className="p-2">
                        <select
                          className="w-full text-black"
                          value={nonSelectedReasons[player] || ""}
                          onChange={e => handleNonSelectedReason(player, e.target.value)}
                        >
                          <option value="">Reden niet geselecteerd</option>
                          {nonSelectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input
                          type="text"
                          className="w-full mt-1 p-1 rounded text-black"
                          placeholder="Extra opmerking (optioneel)"
                          value={nonSelectedComments[player] || ""}
                          onChange={e => handleNonSelectedComment(player, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
          {selected.some(p => !selectedPlayers[p]) && (
            <p className="text-yellow-400 font-semibold mb-2 animate-pulse">⚠️ Sommige spelers hebben nog geen rugnummer!</p>
          )}
        </div>
        {/* RECHTS: LIVE PREVIEW */}
        <div className="w-full md:w-1/2 p-2 md:pr-8 pt-7 flex flex-col">
          <div className="bg-white text-black p-4 rounded-2xl shadow-xl border border-blue-200" style={{ minHeight: 420, transition: "box-shadow 0.33s" }}>
            <div id="mailpreview-only" dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>
      </div>
      {/* Sticky kopieerknop */}
      <FloatingCopyButton onClick={copyToClipboard} success={success} />
      {/* Kleine CSS extra voor animatie */}
      <style>{`
        @keyframes watermark-fade {
          0% { opacity: 0.10; }
          50% { opacity: 0.19; }
          100% { opacity: 0.13; }
        }
        .shadow-xl {
          box-shadow: 0 8px 32px #2166aa18, 0 2px 16px #284cff17 !important;
        }
        .rounded-2xl {
          border-radius: 18px !important;
        }
        button[aria-label="Kopieer e-mail"] {
          animation: ${success ? "copy-pulse 1.2s" : "none"};
        }
        @keyframes copy-pulse {
          0% { box-shadow: 0 0 0 0 #4ec5fc66; }
          70% { box-shadow: 0 0 0 10px #4ec5fc00; }
          100% { box-shadow: 0 0 0 0 #4ec5fc00; }
        }
        /* Hover effects knoppen */
        button, select, input[type="button"], input[type="submit"] {
          transition: box-shadow 0.15s, background 0.17s;
        }
        button:hover:not(:disabled) {
          box-shadow: 0 2px 10px #1469a155 !important;
          background: #1c58b022 !important;
        }
      `}</style>
    </>
  );
}
