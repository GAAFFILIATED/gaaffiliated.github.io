GA AFFILIATED — LUXURY WEBSITE REDESIGN | OCTOBER 2026
====================================================

SITE CONTENT
- index.html: redesigned mobile-first storefront inspired by the editorial layout of the provided Aporro screenshot, with original GA branding and copy.
- luxury.css: new styling and responsive layouts.
- site.js: working mobile navigation, site search, apparel inquiry bag, email inquiry, video sound switch, and support-contact panel.
- ambassadors.html: existing 12-ambassador roster with existing events and published results details preserved, with updated header and styling.
- styles.css and roster.js: original roster styling and filtering.
- assets/: the EXISTING GA team and apparel photographs and GA race-day video (not stock photos).

DEPLOY TO GITHUB PAGES
1. Back up the current GA Affiliated website repo before replacing anything.
2. Extract this ZIP.
3. Open your GA website GitHub repository. Upload ALL files AND the assets/ folder to the ROOT of the repository. Choose overwrite/commit changes for matching files.
4. Verify the final repo root contains index.html, ambassadors.html, luxury.css, site.js, styles.css, roster.js and assets/.
5. If GitHub Pages is already enabled, wait for the deployment to finish and open the GA website URL (or use Settings > Pages to enable it from main /root).
6. Test on iPhone and desktop. Do not change DNS just to test this update.

IMPORTANT FEATURE NOTES
- Four sweatsuit sets are listed at $80 each. Selecting an item adds it to an *inquiry bag*, NOT a checkout; Email My Inquiry opens an email with a readable itemized request.
- The custom team uniform tiles open prefilled email inquiries. The existing FlutterFlow/uniform design builders are separate projects and were NOT linked because no verified public builder URLs were present in the saved website assets. Insert the real published builder URLs when ready.
- The support panel opens an email. It is not live chat.
- The site uses a GA typographic monogram, not a claimed official vector logo. Replace header markup with the original official GA logo when a standalone logo image is available.
- Race footage is set to autoplay muted/loop/playsinline, the mode supported by typical mobile browsers. The visitor may toggle sound. Browser autoplay policy can still prevent autoplay in certain configurations.
- All media are locally included in the ZIP. No hotlinked photos. The external Google Fonts file is optional; fallback fonts render without it.
- The full ambassador page retains its existing record citations and verified-vs-unverified distinctions; this design update does not change them.
- The downloaded ZIP is ready to upload, but it does not automatically update the GitHub repository or publish a live site.

CONTACT: ga.affiliated@gmail.com

GA NEON HEADER UPDATE — OCTOBER 19, 2026
- The actual user-supplied GA electric purple/blue image is saved as assets/ga-neon-header.jpg.
- The image appears immediately below the white navigation header, above the existing Emeri Cotton hero; all existing athlete photos and sections remain unchanged.
- Responsive CSS fills the banner on mobile and keeps the complete image visible on wide screens.
- To update an existing copy of this exact redesigned site, upload only index.html, luxury.css, and assets/ga-neon-header.jpg in their existing paths.
