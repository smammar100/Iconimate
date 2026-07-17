import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: "Run the weekly SEO improver loop for the configured property and tracked keywords.",
});
