import { budget, type CostInput } from "@/lib/costs";
import { kmText, zar } from "@/lib/format";
import { kmBetween, STATION_SOURCE_NOTE, type Place } from "@/lib/places";

export async function downloadReport(place: Place, costs: CostInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const b = budget(place, costs);
  const pageW = doc.internal.pageSize.getWidth();
  let y = 18;

  const write = (text: string, size = 11, gap = 6) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, pageW - 28) as string[];
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      doc.text(line, 14, y);
      y += size * 0.45 + 1.4;
    }
    y += gap;
  };

  doc.setFont("times", "bold");
  write("HomeCheck", 22, 2);
  doc.setFont("times", "normal");
  write("The buyer's reality check", 13, 4);
  doc.setFont("helvetica", "bold");
  write(place.address, 14, 1);
  doc.setFont("helvetica", "normal");
  write(`${place.suburb}, ${place.city} \u00b7 ${place.tenure} \u00b7 ${place.beds} bed \u00b7 ${place.size}`, 11, 4);

  write(
    "This is not a valuation, not a Lightstone report, and not an offer. The price is the figure in this check. Station counts cover a whole police precinct. They do not measure safety on this street.",
    10,
    6,
  );

  doc.setFont("helvetica", "bold");
  write("Monthly ownership", 14, 2);
  doc.setFont("helvetica", "normal");
  write(`Total  ${zar(b.total)} per month`, 12, 2);
  for (const line of b.lines) {
    write(`${line.label}  ${zar(line.monthly)}`, 11, 0.5);
  }
  y += 3;
  write(
    `Price ${zar(b.price)}. Deposit ${zar(b.deposit)} at ${costs.depositPct}%. Bond ${zar(b.principal)} at ${costs.annualRate}% over ${costs.termYears} years. Interest starts from prime 10.50% (May 2026, Rateweb) and is not a bank quote.`,
    10,
    3,
  );
  write(
    `Transfer duty ${zar(b.duty)} under the SARS brackets in force from 1 April 2025. Cash before you move in, deposit plus transfer duty: ${zar(b.cashIn)}. Conveyancer fees are not included.`,
    10,
    4,
  );
  write(
    costs.ratesMonthly == null
      ? `Rates use ${place.finance.name}'s residential tariff (${place.finance.centsPerRand} c/R) on a valuation of ${zar(costs.valuation)}, after a rebate of ${zar(place.finance.rebateRand)}. ${place.finance.tariffNote}`
      : `Rates were typed in as ${zar(b.rates)} a month, instead of the tariff formula.`,
    10,
    5,
  );

  doc.setFont("helvetica", "bold");
  write(place.finance.name, 14, 2);
  doc.setFont("helvetica", "normal");
  write(`${place.finance.opinion} \u00b7 ${place.finance.year}`, 11, 2);
  write(place.finance.summary, 10, 2);
  for (const line of [place.finance.unauthorised, place.finance.water, place.finance.electricity, place.finance.extra]) {
    if (line) write(line, 10, 1);
  }
  write(place.finance.sourceNote, 9, 5);

  doc.setFont("helvetica", "bold");
  write(place.station.name, 14, 2);
  doc.setFont("helvetica", "normal");
  write(
    `${place.station.total.toLocaleString("en-ZA")} reported crimes, ${place.station.period}. ${place.station.yoyLabel}. The station is ${kmText(kmBetween(place.lat, place.lng, place.station.lat, place.station.lng))} from this pin.`,
    11,
    2,
  );
  for (const row of place.station.rows) {
    const delta = row.delta == null ? "" : row.delta > 0 ? `  (+${row.delta})` : `  (${row.delta})`;
    write(`${row.label}: ${row.count.toLocaleString("en-ZA")}${delta}`, 10, 0.4);
  }
  y += 2;
  write(STATION_SOURCE_NOTE, 9, 2);
  write(
    "Do not read a station total as a risk score for a house. Counts are not adjusted for how many people the precinct serves. A busy commercial station records more theft without telling you what a particular erf is like.",
    10,
    3,
  );
  write(place.station.sourceUrl, 9, 5);

  doc.setFont("helvetica", "bold");
  write("Getting around", 14, 2);
  doc.setFont("helvetica", "normal");
  for (const trip of place.commutes) {
    const mins = trip.minutes == null ? "No minute budgeted" : `${trip.minutes} min`;
    write(`${trip.to} \u00b7 ${trip.mode} \u00b7 ${mins}. ${trip.note}`, 10, 1.5);
  }

  y += 4;
  write(`Generated ${new Date().toLocaleString("en-ZA")} by HomeCheck. Confirm tariffs, prime, and transfer duty before you sign.`, 9, 2);

  const file = `${place.suburb.replace(/\s+/g, "-").toLowerCase()}-homecheck.pdf`;
  doc.save(file);
}
