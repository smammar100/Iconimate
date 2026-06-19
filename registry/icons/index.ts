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
import { PresentationIcon } from "./presentation";
import { AlarmIcon } from "./alarm";
import { AlienIcon } from "./alien";
import { AlignBottomIcon } from "./align-bottom";
import { AlignBottomSimpleIcon } from "./align-bottom-simple";
import { AlignCenterHorizontalIcon } from "./align-center-horizontal";
import { AlignCenterHorizontalSimpleIcon } from "./align-center-horizontal-simple";
import { AlignCenterVerticalIcon } from "./align-center-vertical";
import { AlignCenterVerticalSimpleIcon } from "./align-center-vertical-simple";
import { AlignLeftIcon } from "./align-left";
import { AlignLeftSimpleIcon } from "./align-left-simple";
import { AlignRightIcon } from "./align-right";
import { AlignRightSimpleIcon } from "./align-right-simple";
import { AlignTopIcon } from "./align-top";
import { AlignTopSimpleIcon } from "./align-top-simple";
import { AmazonLogoIcon } from "./amazon-logo";
import { AmbulanceIcon } from "./ambulance";
import { AnchorIcon } from "./anchor";
import { AnchorSimpleIcon } from "./anchor-simple";
import { AndroidLogoIcon } from "./android-logo";
import { AngleIcon } from "./angle";
import { AngularIcon } from "./angular";
import { ApertureIcon } from "./aperture";
import { AppStoreLogoIcon } from "./app-store-logo";
import { AppWindowIcon } from "./app-window";
import { AppleLogoIcon } from "./apple-logo";
import { ApplePodcastsLogoIcon } from "./apple-podcasts-logo";
import { ApproximateEqualsIcon } from "./approximate-equals";
import { ArchiveIcon } from "./archive";
import { ArmchairIcon } from "./armchair";
import { ArrowArcLeftIcon } from "./arrow-arc-left";
import { ArrowArcRightIcon } from "./arrow-arc-right";

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
  { slug: "presentation", name: "Presentation", keywords: ["slide", "board", "easel", "deck", "chart", "screen", "lecture", "talk"], Component: PresentationIcon },
  { slug: "alarm", name: "Alarm", keywords: ["clock", "alarm", "timer", "wake", "reminder", "snooze", "time", "ring"], Component: AlarmIcon },
  { slug: "alien", name: "Alien", keywords: ["et", "ufo", "extraterrestrial", "space", "martian", "visitor", "eyes", "glow"], Component: AlienIcon },
  { slug: "align-bottom", name: "Align Bottom", keywords: ["align", "bottom", "layout", "distribute", "arrange", "baseline", "blocks", "drop"], Component: AlignBottomIcon },
  { slug: "align-bottom-simple", name: "Align Bottom Simple", keywords: ["align", "bottom", "simple", "layout", "arrange", "baseline", "block", "drop"], Component: AlignBottomSimpleIcon },
  { slug: "align-center-horizontal", name: "Align Center Horizontal", keywords: ["align", "center", "horizontal", "layout", "distribute", "arrange", "axis", "blocks", "wipe"], Component: AlignCenterHorizontalIcon },
  { slug: "align-center-horizontal-simple", name: "Align Center Horizontal Simple", keywords: ["align", "center", "horizontal", "simple", "layout", "arrange", "axis", "block", "drop", "bounce"], Component: AlignCenterHorizontalSimpleIcon },
  { slug: "align-center-vertical", name: "Align Center Vertical", keywords: ["align", "center", "vertical", "layout", "distribute", "arrange", "axis", "blocks", "drop", "bounce"], Component: AlignCenterVerticalIcon },
  { slug: "align-center-vertical-simple", name: "Align Center Vertical Simple", keywords: ["align", "center", "vertical", "simple", "layout", "arrange", "axis", "block", "drop", "bounce"], Component: AlignCenterVerticalSimpleIcon },
  { slug: "align-left", name: "Align Left", keywords: ["align", "left", "layout", "distribute", "arrange", "baseline", "blocks", "drop", "bounce"], Component: AlignLeftIcon },
  { slug: "align-left-simple", name: "Align Left Simple", keywords: ["align", "left", "simple", "layout", "arrange", "baseline", "block", "drop", "bounce"], Component: AlignLeftSimpleIcon },
  { slug: "align-right", name: "Align Right", keywords: ["align", "right", "layout", "distribute", "arrange", "baseline", "blocks", "drop", "bounce"], Component: AlignRightIcon },
  { slug: "align-right-simple", name: "Align Right Simple", keywords: ["align", "right", "simple", "layout", "arrange", "baseline", "block", "drop", "bounce"], Component: AlignRightSimpleIcon },
  { slug: "align-top", name: "Align Top", keywords: ["align", "top", "layout", "distribute", "arrange", "baseline", "blocks", "drop", "bounce"], Component: AlignTopIcon },
  { slug: "align-top-simple", name: "Align Top Simple", keywords: ["align", "top", "simple", "layout", "arrange", "baseline", "block", "drop", "bounce"], Component: AlignTopSimpleIcon },
  { slug: "amazon-logo", name: "Amazon Logo", keywords: ["amazon", "logo", "brand", "shop", "shopping", "arrow", "smile", "wobble"], Component: AmazonLogoIcon },
  { slug: "ambulance", name: "Ambulance", keywords: ["ambulance", "emergency", "medical", "hospital", "van", "vehicle", "rescue", "siren", "drive"], Component: AmbulanceIcon },
  { slug: "anchor", name: "Anchor", keywords: ["anchor", "ship", "boat", "nautical", "sea", "marine", "harbor", "moor", "sway"], Component: AnchorIcon },
  { slug: "anchor-simple", name: "Anchor Simple", keywords: ["anchor", "simple", "ship", "boat", "nautical", "sea", "marine", "harbor", "moor", "sway"], Component: AnchorSimpleIcon },
  { slug: "android-logo", name: "Android Logo", keywords: ["android", "logo", "robot", "bot", "google", "mobile", "phone", "os", "blink"], Component: AndroidLogoIcon },
  { slug: "angle", name: "Angle", keywords: ["angle", "geometry", "measure", "protractor", "degree", "math", "corner", "axis", "draw"], Component: AngleIcon },
  { slug: "angular", name: "Angular", keywords: ["angular", "logo", "brand", "framework", "shield", "badge", "javascript", "typescript", "google", "flip"], Component: AngularIcon },
  { slug: "aperture", name: "Aperture", keywords: ["aperture", "camera", "lens", "iris", "photo", "shutter", "exposure", "f-stop", "focus", "blades"], Component: ApertureIcon },
  { slug: "app-store-logo", name: "App Store Logo", keywords: ["app store", "apple", "ios", "logo", "brand", "download", "apps", "draw"], Component: AppStoreLogoIcon },
  { slug: "app-window", name: "App Window", keywords: ["app", "window", "browser", "screen", "ui", "application", "desktop", "dots", "blink"], Component: AppWindowIcon },
  { slug: "apple-logo", name: "Apple Logo", keywords: ["apple", "logo", "brand", "fruit", "mac", "ios", "leaf", "flick"], Component: AppleLogoIcon },
  { slug: "apple-podcasts-logo", name: "Apple Podcasts Logo", keywords: ["apple", "podcasts", "podcast", "broadcast", "audio", "microphone", "mic", "logo", "brand"], Component: ApplePodcastsLogoIcon },
  { slug: "approximate-equals", name: "Approximate Equals", keywords: ["approximately", "equal", "almost", "roughly", "math", "tilde", "wave", "≈"], Component: ApproximateEqualsIcon },
  { slug: "archive", name: "Archive", keywords: ["box", "storage", "store", "save", "file", "inbox", "lid", "stash"], Component: ArchiveIcon },
  { slug: "armchair", name: "Armchair", keywords: ["chair", "seat", "sofa", "couch", "furniture", "lounge", "cushion", "puff"], Component: ArmchairIcon },
  { slug: "arrow-arc-left", name: "Arrow Arc Left", keywords: ["undo", "back", "rewind", "refresh", "rotate", "counter-clockwise", "arc", "return"], Component: ArrowArcLeftIcon },
  { slug: "arrow-arc-right", name: "Arrow Arc Right", keywords: ["redo", "forward", "refresh", "rotate", "clockwise", "arc", "reload"], Component: ArrowArcRightIcon },
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
  PresentationIcon,
  AlarmIcon,
  AlienIcon,
  AlignBottomIcon,
  AlignBottomSimpleIcon,
  AlignCenterHorizontalIcon,
  AlignCenterHorizontalSimpleIcon,
  AlignCenterVerticalIcon,
  AlignCenterVerticalSimpleIcon,
  AlignLeftIcon,
  AlignLeftSimpleIcon,
  AlignRightIcon,
  AlignRightSimpleIcon,
  AlignTopIcon,
  AlignTopSimpleIcon,
  AmazonLogoIcon,
  AmbulanceIcon,
  AnchorIcon,
  AnchorSimpleIcon,
  AndroidLogoIcon,
  AngleIcon,
  AngularIcon,
  ApertureIcon,
  AppStoreLogoIcon,
  AppWindowIcon,
  AppleLogoIcon,
  ApplePodcastsLogoIcon,
  ApproximateEqualsIcon,
  ArchiveIcon,
  ArmchairIcon,
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
};
