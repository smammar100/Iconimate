import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { IconHandle, IconProps } from "@/lib/icon";
import { BellIcon } from "./bell";
import { HeartIcon } from "./heart";
import { StarIcon } from "./star";
import { BookmarkIcon } from "./bookmark";
import { SunIcon } from "./sun";
import { ArrowRightIcon } from "./arrow-right";
import { AcornIcon } from "./acorn";
import { MailIcon } from "./mail";
import { BoltIcon } from "./bolt";
import { MoonIcon } from "./moon";
import { CameraIcon } from "./camera";
import { TrashIcon } from "./trash";
import { CloudIcon } from "./cloud";
import { AddressBookIcon } from "./address-book";
import { ControlTowerIcon } from "./control-tower";
import { PhoneBookIcon } from "./phone-book";
import { AirplaneIcon } from "./airplane";
import { AirplaneInFlightIcon } from "./airplane-in-flight";
import { AirplaneLandingIcon } from "./airplane-landing";
import { AirplaneTakeoffIcon } from "./airplane-takeoff";
import { AirplaneTaxiingIcon } from "./airplane-taxiing";
import { AirplaneTiltIcon } from "./airplane-tilt";

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<IconHandle>>;

export interface IconEntry {
  slug: string;
  name: string;
  keywords: string[];
  Component: IconComponent;
}

export const icons: IconEntry[] = [
  { slug: "bell", name: "Bell", keywords: ["notification", "alert", "ring"], Component: BellIcon },
  { slug: "heart", name: "Heart", keywords: ["like", "love", "favorite"], Component: HeartIcon },
  { slug: "star", name: "Star", keywords: ["favorite", "rate", "review"], Component: StarIcon },
  { slug: "bookmark", name: "Bookmark", keywords: ["save", "read later", "flag"], Component: BookmarkIcon },
  { slug: "sun", name: "Sun", keywords: ["light", "theme", "day", "weather"], Component: SunIcon },
  { slug: "arrow-right", name: "Arrow Right", keywords: ["send", "next", "forward", "go"], Component: ArrowRightIcon },
  { slug: "acorn", name: "Acorn", keywords: ["nut", "oak", "seed", "autumn", "fall"], Component: AcornIcon },
  { slug: "mail", name: "Mail", keywords: ["email", "envelope", "message", "inbox", "send"], Component: MailIcon },
  { slug: "bolt", name: "Bolt", keywords: ["lightning", "flash", "power", "energy", "zap"], Component: BoltIcon },
  { slug: "moon", name: "Moon", keywords: ["night", "dark", "theme", "sleep", "crescent"], Component: MoonIcon },
  { slug: "camera", name: "Camera", keywords: ["photo", "capture", "picture", "lens", "shutter"], Component: CameraIcon },
  { slug: "trash", name: "Trash", keywords: ["delete", "bin", "remove", "garbage"], Component: TrashIcon },
  { slug: "cloud", name: "Cloud", keywords: ["weather", "sky", "storage", "upload"], Component: CloudIcon },
  { slug: "address-book", name: "Address Book", keywords: ["contact", "contacts", "person", "profile", "directory", "card"], Component: AddressBookIcon },
  { slug: "control-tower", name: "Control Tower", keywords: ["airport", "aviation", "atc", "air traffic", "antenna", "radar"], Component: ControlTowerIcon },
  { slug: "phone-book", name: "Phone Book", keywords: ["address book", "contacts", "directory", "telephone", "tabs", "yellow pages"], Component: PhoneBookIcon },
  { slug: "airplane", name: "Airplane", keywords: ["plane", "flight", "fly", "travel", "aircraft", "jet"], Component: AirplaneIcon },
  { slug: "airplane-in-flight", name: "Airplane in Flight", keywords: ["plane", "flight", "fly", "travel", "cruise", "departure", "contrail"], Component: AirplaneInFlightIcon },
  { slug: "airplane-landing", name: "Airplane Landing", keywords: ["plane", "landing", "arrive", "arrival", "descent", "approach", "runway", "travel"], Component: AirplaneLandingIcon },
  { slug: "airplane-takeoff", name: "Airplane Takeoff", keywords: ["plane", "takeoff", "depart", "departure", "climb", "ascend", "runway", "travel"], Component: AirplaneTakeoffIcon },
  { slug: "airplane-taxiing", name: "Airplane Taxiing", keywords: ["plane", "taxi", "taxiing", "ground", "runway", "roll", "gate", "travel"], Component: AirplaneTaxiingIcon },
  { slug: "airplane-tilt", name: "Airplane Tilt", keywords: ["plane", "tilt", "bank", "fly", "travel", "jet", "turn"], Component: AirplaneTiltIcon },
];

/** Slugs hidden from the public home page (still in the registry and installable). */
export const HOME_HIDDEN_SLUGS = new Set<string>([
  "bell",
  "heart",
  "star",
  "bookmark",
  "sun",
  "arrow-right",
  "bolt",
  "moon",
  "camera",
  "trash",
  "cloud",
  "mail",
]);

/** Icons shown on the home page (the registry minus the hidden slugs). */
export const visibleIcons: IconEntry[] = icons.filter((entry) => !HOME_HIDDEN_SLUGS.has(entry.slug));

export {
  BellIcon,
  HeartIcon,
  StarIcon,
  BookmarkIcon,
  SunIcon,
  ArrowRightIcon,
  AcornIcon,
  MailIcon,
  BoltIcon,
  MoonIcon,
  CameraIcon,
  TrashIcon,
  CloudIcon,
  AddressBookIcon,
  ControlTowerIcon,
  PhoneBookIcon,
  AirplaneIcon,
  AirplaneInFlightIcon,
  AirplaneLandingIcon,
  AirplaneTakeoffIcon,
  AirplaneTaxiingIcon,
  AirplaneTiltIcon,
};
