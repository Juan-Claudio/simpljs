// load Waiter and install Simpljs in Window
import { Waiter, installSimpljsInWindow } from "simpljs";
installSimpljsInWindow();

// load components
// HEADER
import "./src/components/header/header.html.js";
import { reloadPageOnClickOnSimpljsTitle } from "./src/components/header/header.event.js";
//NAV
import { nav } from "./src/components/nav/nav.html.js";
import {
  alertVersionOnClickOnBtn,
  displayLicenseOnClickOnBtn,
  toggleReadmeOnClickOnBtn,
} from "./src/components/nav/nav.event.js";
// MAIN
import { main } from "./src/components/main/main.html.js";
//FOOTER
import { footer } from "./src/components/footer/footer.html.js";
// MODAL_LICENSE
import "./src/components/modalLicense/modalLicense.html.js";
import "./src/components/license/license.html.js";
import {
  closeModalLicense,
  showLicenseText,
} from "./src/components/modalLicense/modalLicense.event.js";
//COMMONS
import {
  addActInsertReadme,
  addActShowLicense,
} from "./src/components/common/common.event.js";

const bodyWaiter = new Waiter("body");

document.addEventListener("DOMContentLoaded", () => {
  //start when document loaded

  //LOAD HEADER
  $("<header>").build.in($("#app"));
  const armRefreshOnClickOnTitle = reloadPageOnClickOnSimpljsTitle(bodyWaiter);

  //LOAD NAV
  nav();
  addActInsertReadme();
  addActShowLicense();
  const armAlertVersion = alertVersionOnClickOnBtn(bodyWaiter);
  const armDisplayLicense = displayLicenseOnClickOnBtn(bodyWaiter);
  const armToggleReadme = toggleReadmeOnClickOnBtn(bodyWaiter);

  //LOAD MAIN
  main();

  //LOAD FOOTER
  footer();

  //LOAD MODAL_LICENSE EVENTS
  const armCloseLicenseModal = closeModalLicense(bodyWaiter);
  const showLicense = showLicenseText(bodyWaiter);

  bodyWaiter.wait();
  //end script after page loaded
});
