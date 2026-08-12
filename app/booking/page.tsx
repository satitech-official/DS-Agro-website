import type { Metadata } from "next";
import { BookingExperience } from "../../components/BookingExperience";

export const metadata: Metadata = {
  title: "Book your visit",
  description: "Check real room availability and send a booking inquiry to DS Agro Tourism & Resort.",
};

export default function BookingPage() {
  return <BookingExperience />;
}
