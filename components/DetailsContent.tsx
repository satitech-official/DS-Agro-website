import {
  activities,
  amenities,
  dayOutingIncludes,
  dayOutingRates,
  roomInventory,
  stayRates,
  terms,
} from "../data/site";

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <div className="details-heading">
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    <p>{copy}</p>
  </div>;
}

function StayDetails() {
  return <section className="details-content section reveal" aria-labelledby="room-details-title">
    <SectionHeading
      eyebrow="Accommodation"
      title="Rooms and current inventory"
      copy="Room counts and tariffs below follow the supplied DS Agro Tourism & Resort rate card and accommodation update."
    />
    <div className="room-inventory" id="room-details-title">
      {roomInventory.map((room, index) => <article className="detail-card" key={room.name}>
        <span>0{index + 1}</span><h3>{room.name}</h3><strong>{room.count}</strong><p>{room.detail}</p>
      </article>)}
    </div>
    <div className="tariff-block">
      <div className="tariff-heading"><div><p className="eyebrow">Farm stay</p><h3>Rates and inclusions</h3></div><p>CP includes breakfast. MAP includes breakfast and dinner.</p></div>
      <div className="tariff-table-wrap">
        <table className="tariff-table">
          <thead><tr><th scope="col">Room type</th><th scope="col">CP · Mon-Fri</th><th scope="col">CP · Sat-Sun</th><th scope="col">MAP · Mon-Fri</th><th scope="col">MAP · Sat-Sun</th></tr></thead>
          <tbody>{stayRates.map(rate => <tr key={rate.room}>
            <th scope="row">{rate.room}<small>{rate.occupancy}</small></th><td>{rate.cpWeekday}</td><td>{rate.cpWeekend}</td><td>{rate.mapWeekday}</td><td>{rate.mapWeekend}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="rate-note">Dormitory package is without breakfast. Weekend room bookings are subject to the additional charge stated in the Terms & Conditions. Taxes apply.</p>
    </div>
  </section>;
}

function DayOutingDetails() {
  return <section className="details-content section reveal" aria-labelledby="day-outing-details-title">
    <SectionHeading eyebrow="Day package" title="Choose your outing" copy="Rates are per person. Share your date, group size and meal preference to confirm the booking." />
    <div className="outing-grid" id="day-outing-details-title">
      {dayOutingRates.map(rate => <article className="outing-card" key={rate.days}>
        <p>{rate.days}</p><div><span>Veg</span><strong>{rate.veg}</strong></div><div><span>Non-Veg</span><strong>{rate.nonVeg}</strong></div>
      </article>)}
      <article className="outing-card includes-card"><p>Package includes</p><ul>{dayOutingIncludes.map(item => <li key={item}>{item}</li>)}</ul></article>
    </div>
  </section>;
}

function ListDetails({ kind }: { kind: "amenities" | "activities" }) {
  const items = kind === "amenities" ? amenities : activities;
  return <section className="details-content section reveal" aria-labelledby={`${kind}-details-title`}>
    <SectionHeading
      eyebrow={kind === "amenities" ? "At the resort" : "Things to do"}
      title={kind === "amenities" ? "Amenities for an easy escape" : "Activities for every energy"}
      copy={kind === "amenities" ? "Practical comforts and family-friendly spaces are available across the resort." : "Activity availability can depend on weather, maintenance, age guidance and supervision."}
    />
    <div className="feature-list" id={`${kind}-details-title`}>{items.map((item, index) => <article key={item}><span>0{index + 1}</span><h3>{item}</h3></article>)}</div>
  </section>;
}

function TermsDetails() {
  return <section className="details-content section reveal" aria-labelledby="terms-details-title">
    <SectionHeading eyebrow="Booking policy" title="Terms & Conditions" copy="Please read these conditions before paying the booking advance." />
    <ol className="terms-list" id="terms-details-title">{terms.map((term, index) => <li key={term}><span>{String(index + 1).padStart(2, "0")}</span><p>{term}</p></li>)}</ol>
  </section>;
}

export function DetailsContent({ slug }: { slug: string }) {
  if (slug === "stay") return <StayDetails />;
  if (slug === "day-outing") return <DayOutingDetails />;
  if (slug === "amenities") return <ListDetails kind="amenities" />;
  if (slug === "experiences") return <ListDetails kind="activities" />;
  if (slug === "terms") return <TermsDetails />;
  return null;
}
