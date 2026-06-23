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
import { ArrowBendDoubleUpLeftIcon } from "./arrow-bend-double-up-left";
import { ArrowBendDoubleUpRightIcon } from "./arrow-bend-double-up-right";
import { ArrowBendDownLeftIcon } from "./arrow-bend-down-left";
import { ArrowBendDownRightIcon } from "./arrow-bend-down-right";
import { ArrowBendLeftDownIcon } from "./arrow-bend-left-down";
import { ArrowBendLeftUpIcon } from "./arrow-bend-left-up";
import { ArrowBendRightDownIcon } from "./arrow-bend-right-down";
import { ArrowBendRightUpIcon } from "./arrow-bend-right-up";
import { ArrowBendUpLeftIcon } from "./arrow-bend-up-left";
import { ArrowBendUpRightIcon } from "./arrow-bend-up-right";
import { ArrowCircleDownIcon } from "./arrow-circle-down";
import { ArrowCircleDownLeftIcon } from "./arrow-circle-down-left";
import { ArrowCircleDownRightIcon } from "./arrow-circle-down-right";
import { ArrowCircleLeftIcon } from "./arrow-circle-left";
import { ArrowCircleRightIcon } from "./arrow-circle-right";
import { ArrowCircleUpIcon } from "./arrow-circle-up";
import { ArrowCircleUpLeftIcon } from "./arrow-circle-up-left";
import { ArrowCircleUpRightIcon } from "./arrow-circle-up-right";
import { ArrowClockwiseIcon } from "./arrow-clockwise";
import { ArrowCounterClockwiseIcon } from "./arrow-counter-clockwise";
import { ArrowDownIcon } from "./arrow-down";
import { ArrowDownLeftIcon } from "./arrow-down-left";
import { ArrowDownRightIcon } from "./arrow-down-right";
import { ArrowElbowDownLeftIcon } from "./arrow-elbow-down-left";
import { ArrowElbowDownRightIcon } from "./arrow-elbow-down-right";
import { ArrowElbowLeftIcon } from "./arrow-elbow-left";
import { ArrowElbowLeftDownIcon } from "./arrow-elbow-left-down";
import { ArrowElbowLeftUpIcon } from "./arrow-elbow-left-up";
import { ArrowElbowRightIcon } from "./arrow-elbow-right";
import { ArrowElbowRightDownIcon } from "./arrow-elbow-right-down";
import { ArrowElbowRightUpIcon } from "./arrow-elbow-right-up";
import { ArrowElbowUpLeftIcon } from "./arrow-elbow-up-left";
import { ArrowElbowUpRightIcon } from "./arrow-elbow-up-right";
import { ArrowLeftIcon } from "./arrow-left";
import { ArrowLineDownIcon } from "./arrow-line-down";
import { ArrowLineDownLeftIcon } from "./arrow-line-down-left";
import { ArrowLineDownRightIcon } from "./arrow-line-down-right";
import { ArrowLineLeftIcon } from "./arrow-line-left";
import { ArrowLineRightIcon } from "./arrow-line-right";
import { ArrowLineUpIcon } from "./arrow-line-up";
import { ArrowLineUpLeftIcon } from "./arrow-line-up-left";
import { ArrowLineUpRightIcon } from "./arrow-line-up-right";
import { ArrowUpIcon } from "./arrow-up";
import { ArrowUpLeftIcon } from "./arrow-up-left";
import { ArrowUpRightIcon } from "./arrow-up-right";

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
  { slug: "arrow-bend-double-up-left", name: "Arrow Bend Double Up-Left", keywords: ["reply", "reply all", "return", "back", "undo", "double", "bend", "turn"], Component: ArrowBendDoubleUpLeftIcon },
  { slug: "arrow-bend-double-up-right", name: "Arrow Bend Double Up-Right", keywords: ["forward", "redo", "share", "double", "bend", "turn", "next", "send"], Component: ArrowBendDoubleUpRightIcon },
  { slug: "arrow-bend-down-left", name: "Arrow Bend Down-Left", keywords: ["return", "back", "reply", "bend", "turn", "down", "left", "branch"], Component: ArrowBendDownLeftIcon },
  { slug: "arrow-bend-down-right", name: "Arrow Bend Down-Right", keywords: ["forward", "bend", "turn", "down", "right", "branch", "redirect"], Component: ArrowBendDownRightIcon },
  { slug: "arrow-bend-left-down", name: "Arrow Bend Left-Down", keywords: ["bend", "turn", "left", "down", "branch", "redirect", "route"], Component: ArrowBendLeftDownIcon },
  { slug: "arrow-bend-left-up", name: "Arrow Bend Left-Up", keywords: ["bend", "turn", "left", "up", "branch", "redirect", "route"], Component: ArrowBendLeftUpIcon },
  { slug: "arrow-bend-right-down", name: "Arrow Bend Right-Down", keywords: ["bend", "turn", "right", "down", "branch", "redirect", "route"], Component: ArrowBendRightDownIcon },
  { slug: "arrow-bend-right-up", name: "Arrow Bend Right-Up", keywords: ["bend", "turn", "right", "up", "branch", "redirect", "route"], Component: ArrowBendRightUpIcon },
  { slug: "arrow-bend-up-left", name: "Arrow Bend Up-Left", keywords: ["reply", "return", "back", "bend", "turn", "up", "left", "branch"], Component: ArrowBendUpLeftIcon },
  { slug: "arrow-bend-up-right", name: "Arrow Bend Up-Right", keywords: ["forward", "share", "bend", "turn", "up", "right", "branch", "next"], Component: ArrowBendUpRightIcon },
  { slug: "arrow-circle-down", name: "Arrow Circle Down", keywords: ["download", "scroll", "expand", "collapse", "circle", "down", "chevron"], Component: ArrowCircleDownIcon },
  { slug: "arrow-circle-down-left", name: "Arrow Circle Down-Left", keywords: ["circle", "down", "left", "diagonal", "scroll", "arrow"], Component: ArrowCircleDownLeftIcon },
  { slug: "arrow-circle-down-right", name: "Arrow Circle Down-Right", keywords: ["circle", "down", "right", "diagonal", "scroll", "arrow"], Component: ArrowCircleDownRightIcon },
  { slug: "arrow-circle-left", name: "Arrow Circle Left", keywords: ["circle", "left", "back", "previous", "scroll", "arrow"], Component: ArrowCircleLeftIcon },
  { slug: "arrow-circle-right", name: "Arrow Circle Right", keywords: ["circle", "right", "next", "forward", "scroll", "arrow"], Component: ArrowCircleRightIcon },
  { slug: "arrow-circle-up", name: "Arrow Circle Up", keywords: ["circle", "up", "scroll", "collapse", "top", "upload", "arrow"], Component: ArrowCircleUpIcon },
  { slug: "arrow-circle-up-left", name: "Arrow Circle Up-Left", keywords: ["circle", "up", "left", "diagonal", "scroll", "arrow"], Component: ArrowCircleUpLeftIcon },
  { slug: "arrow-circle-up-right", name: "Arrow Circle Up-Right", keywords: ["circle", "up", "right", "diagonal", "scroll", "external", "arrow"], Component: ArrowCircleUpRightIcon },
  { slug: "arrow-clockwise", name: "Arrow Clockwise", keywords: ["refresh", "reload", "spin", "loading", "rotate", "redo", "sync", "clockwise"], Component: ArrowClockwiseIcon },
  { slug: "arrow-counter-clockwise", name: "Arrow Counter Clockwise", keywords: ["undo", "reload", "refresh", "rotate", "back", "revert", "history", "counter-clockwise"], Component: ArrowCounterClockwiseIcon },
  { slug: "arrow-down", name: "Arrow Down", keywords: ["down", "download", "descend", "expand", "south", "scroll"], Component: ArrowDownIcon },
  { slug: "arrow-down-left", name: "Arrow Down-Left", keywords: ["down", "left", "diagonal", "southwest", "descend"], Component: ArrowDownLeftIcon },
  { slug: "arrow-down-right", name: "Arrow Down-Right", keywords: ["down", "right", "diagonal", "southeast", "descend", "expand"], Component: ArrowDownRightIcon },
  { slug: "arrow-elbow-down-left", name: "Arrow Elbow Down-Left", keywords: ["elbow", "down", "left", "return", "bend", "reply", "branch"], Component: ArrowElbowDownLeftIcon },
  { slug: "arrow-elbow-down-right", name: "Arrow Elbow Down-Right", keywords: ["elbow", "down", "right", "return", "bend", "branch"], Component: ArrowElbowDownRightIcon },
  { slug: "arrow-elbow-left", name: "Arrow Elbow Left", keywords: ["elbow", "left", "turn", "bend", "branch", "merge"], Component: ArrowElbowLeftIcon },
  { slug: "arrow-elbow-left-down", name: "Arrow Elbow Left-Down", keywords: ["elbow", "left", "down", "return", "bend", "branch"], Component: ArrowElbowLeftDownIcon },
  { slug: "arrow-elbow-left-up", name: "Arrow Elbow Left-Up", keywords: ["elbow", "left", "up", "return", "bend", "reply", "branch", "north"], Component: ArrowElbowLeftUpIcon },
  { slug: "arrow-elbow-right", name: "Arrow Elbow Right", keywords: ["elbow", "right", "turn", "bend", "branch", "merge"], Component: ArrowElbowRightIcon },
  { slug: "arrow-elbow-right-down", name: "Arrow Elbow Right-Down", keywords: ["elbow", "right", "down", "return", "bend", "branch"], Component: ArrowElbowRightDownIcon },
  { slug: "arrow-elbow-right-up", name: "Arrow Elbow Right-Up", keywords: ["elbow", "right", "up", "return", "bend", "branch"], Component: ArrowElbowRightUpIcon },
  { slug: "arrow-elbow-up-left", name: "Arrow Elbow Up-Left", keywords: ["elbow", "up", "left", "return", "bend", "branch"], Component: ArrowElbowUpLeftIcon },
  { slug: "arrow-elbow-up-right", name: "Arrow Elbow Up-Right", keywords: ["elbow", "up", "right", "return", "bend", "branch"], Component: ArrowElbowUpRightIcon },
  { slug: "arrow-left", name: "Arrow Left", keywords: ["left", "back", "previous", "west", "return"], Component: ArrowLeftIcon },
  { slug: "arrow-line-down", name: "Arrow Line Down", keywords: ["line", "down", "bottom", "baseline", "download", "to bottom", "skip"], Component: ArrowLineDownIcon },
  { slug: "arrow-line-down-left", name: "Arrow Line Down-Left", keywords: ["line", "down", "left", "diagonal", "southwest", "to corner"], Component: ArrowLineDownLeftIcon },
  { slug: "arrow-line-down-right", name: "Arrow Line Down-Right", keywords: ["line", "down", "right", "diagonal", "southeast", "to corner"], Component: ArrowLineDownRightIcon },
  { slug: "arrow-line-left", name: "Arrow Line Left", keywords: ["line", "left", "west", "to edge", "first"], Component: ArrowLineLeftIcon },
  { slug: "arrow-line-right", name: "Arrow Line Right", keywords: ["line", "right", "east", "to edge", "last"], Component: ArrowLineRightIcon },
  { slug: "arrow-line-up", name: "Arrow Line Up", keywords: ["line", "up", "top", "upload", "to top"], Component: ArrowLineUpIcon },
  { slug: "arrow-line-up-left", name: "Arrow Line Up-Left", keywords: ["line", "up", "left", "diagonal", "northwest", "to corner"], Component: ArrowLineUpLeftIcon },
  { slug: "arrow-line-up-right", name: "Arrow Line Up-Right", keywords: ["line", "up", "right", "diagonal", "northeast", "to corner"], Component: ArrowLineUpRightIcon },
  { slug: "arrow-up", name: "Arrow Up", keywords: ["up", "upload", "ascend", "north", "top", "rise"], Component: ArrowUpIcon },
  { slug: "arrow-up-left", name: "Arrow Up-Left", keywords: ["up", "left", "diagonal", "northwest", "ascend"], Component: ArrowUpLeftIcon },
  { slug: "arrow-up-right", name: "Arrow Up-Right", keywords: ["up", "right", "diagonal", "northeast", "ascend", "external"], Component: ArrowUpRightIcon },
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
  ArrowBendDoubleUpLeftIcon,
  ArrowBendDoubleUpRightIcon,
  ArrowBendDownLeftIcon,
  ArrowBendDownRightIcon,
  ArrowBendLeftDownIcon,
  ArrowBendLeftUpIcon,
  ArrowBendRightDownIcon,
  ArrowBendRightUpIcon,
  ArrowBendUpLeftIcon,
  ArrowBendUpRightIcon,
  ArrowCircleDownIcon,
  ArrowCircleDownLeftIcon,
  ArrowCircleDownRightIcon,
  ArrowCircleLeftIcon,
  ArrowCircleRightIcon,
  ArrowCircleUpIcon,
  ArrowCircleUpLeftIcon,
  ArrowCircleUpRightIcon,
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowElbowDownLeftIcon,
  ArrowElbowDownRightIcon,
  ArrowElbowLeftIcon,
  ArrowElbowLeftDownIcon,
  ArrowElbowLeftUpIcon,
  ArrowElbowRightIcon,
  ArrowElbowRightDownIcon,
  ArrowElbowRightUpIcon,
  ArrowElbowUpLeftIcon,
  ArrowElbowUpRightIcon,
  ArrowLeftIcon,
  ArrowLineDownIcon,
  ArrowLineDownLeftIcon,
  ArrowLineDownRightIcon,
  ArrowLineLeftIcon,
  ArrowLineRightIcon,
  ArrowLineUpIcon,
  ArrowLineUpLeftIcon,
  ArrowLineUpRightIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
};
