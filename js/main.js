// ===== 공통 헤더 / 전체화면 메뉴 주입 (언어 인식형) =====
// 한국어 페이지는 루트(/), 영어 페이지는 /en/ 에 둔다.
// body[data-lang]="ko|en" 으로 언어를 구분하고 그에 맞게
// 자산 경로와 언어 전환 링크를 생성한다.
(function () {
  var lang = document.body.getAttribute("data-lang") === "en" ? "en" : "ko";
  var assetBase = lang === "en" ? "../assets/" : "assets/";
  var homeHref = "index.html"; // 폴더 내 상대 경로 (ko: /index.html, en: /en/index.html)

  // 현재 파일명 → 언어 전환 시 같은 페이지로 이동
  var file = location.pathname.split("/").pop();
  if (!file) file = "index.html";
  var korHref = (lang === "en" ? "../" : "") + file;
  var engHref = (lang === "en" ? "" : "en/") + file;

  var hasHero = !!document.querySelector(".hero");

  // PC 전용 상단 네비게이션(모바일·메뉴 열림 시엔 CSS로 숨김) — 현재 페이지는 .on 표시
  // 첫 화면(index, 히어로 있음)에는 표시하지 않고 서브페이지에서만 노출
  var navHTML = "";
  if (!hasHero) {
    var navItems = [
      { href: "about.html", label: "About" },
      { href: "team.html", label: "Team" },
      { href: "fund.html", label: "Fund" },
      { href: "portfolio.html", label: "Portfolio" }
    ];
    navHTML = '<nav class="header-nav">';
    navItems.forEach(function (n) {
      navHTML +=
        '<a class="header-nav-link' + (file === n.href ? " on" : "") + '" href="' + n.href + '">' +
        n.label + "</a>";
    });
    navHTML += "</nav>";
  }

  var headerHTML =
    '<header class="site-header' + (hasHero ? "" : " solid") + '">' +
    '  <h1 class="logo"><a href="' + homeHref + '" title="CRIT Ventures">CRIT VENTURES</a></h1>' +
    '  <div class="header-right">' +
    '    <ul class="lang">' +
    '      <li class="' + (lang === "ko" ? "on" : "") + '"><a href="' + korHref + '">KOR</a></li>' +
    '      <li class="' + (lang === "en" ? "on" : "") + '"><a href="' + engHref + '">ENG</a></li>' +
    "    </ul>" +
    navHTML +
    '    <button type="button" class="btn-menu" aria-label="' + (lang === "en" ? "Open menu" : "메뉴 열기") + '" aria-expanded="false">' +
    "      <span></span><span></span><span></span>" +
    "    </button>" +
    "  </div>" +
    "</header>";

  var menuItems = [
    { href: "about.html", img: "slide1.jpg", label: "About" },
    { href: "team.html", img: "change1.jpg", label: "Team" },
    { href: "fund.html", img: "slide3.jpg", label: "Fund" },
    { href: "portfolio.html", img: "change2.jpg", label: "Portfolio" }
  ];
  var menuHTML = '<nav class="fullmenu" aria-hidden="true">';
  menuItems.forEach(function (m) {
    // 항목별 클래스(fm-about 등) — 사진 밝기를 개별 조정하기 위함
    menuHTML +=
      '<a class="fullmenu-item fm-' + m.label.toLowerCase() + '" href="' + m.href + '">' +
      '<img class="fullmenu-bg" src="' + assetBase + "img/" + m.img + '" alt="">' +
      '<span class="fullmenu-label">' + m.label + "</span></a>";
  });
  menuHTML += "</nav>";

  document.body.insertAdjacentHTML("afterbegin", headerHTML + menuHTML);

  // 첫 화면(히어로)에서는 스크롤바 숨김 (스크롤 내용이 없음)
  var docEl = document.documentElement;
  if (hasHero) docEl.classList.add("hide-scroll");

  // 햄버거 메뉴 열기/닫기
  var btn = document.querySelector(".btn-menu");
  var menu = document.querySelector(".fullmenu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? (lang === "en" ? "Close menu" : "메뉴 닫기") : (lang === "en" ? "Open menu" : "메뉴 열기"));
      menu.setAttribute("aria-hidden", !open);
      // 메뉴 열림 동안 스크롤바 숨김(첫 화면이 아니면 닫을 때 다시 표시)
      if (open) docEl.classList.add("hide-scroll");
      else if (!hasHero) docEl.classList.remove("hide-scroll");
    });
  }

  // 배경 슬라이드쇼 (index 첫 화면에만 존재): 5초마다 전환
  var slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    var current = 0;
    setInterval(function () {
      slides[current].classList.remove("on");
      current = (current + 1) % slides.length;
      slides[current].classList.add("on");
    }, 5000);
  }

  // 팀 그리드: 컬러 사진 위에 흑백 레이어를 얹어 둔다(호버 시 흑백이 사라짐).
  // 흑백을 런타임 필터가 아닌 별도 이미지 파일로 처리해 정지 상태에서 또렷하다.
  document.querySelectorAll(".member-photo > img").forEach(function (img) {
    img.classList.add("ph-color");
    var bw = document.createElement("img");
    bw.className = "ph-bw";
    bw.alt = "";
    bw.src = img.getAttribute("src").replace(/(\.[a-z]+)$/i, "_bw$1");
    img.parentNode.appendChild(bw);
  });

  // 팀 프로필 카드 클릭 → 상세 모달
  var modal = document.querySelector(".member-modal");
  if (modal) {
    var modalBody = modal.querySelector(".member-modal-body");
    document.querySelectorAll(".member-card").forEach(function (card) {
      card.addEventListener("click", function () {
        // 상세 내용을 좌측 사진(.m-left) / 우측 정보(.m-right) 두 칼럼으로 재구성
        var detail = card.querySelector(".member-detail").cloneNode(true);
        var photo = detail.querySelector(".m-photo");
        var left = document.createElement("div");
        left.className = "m-left";
        if (photo) {
          // 모달은 크게 표시되므로 원본 고해상도(orig/)를 사용해 선명하게
          photo.src = photo.getAttribute("src").replace(/([^/]+)$/, "orig/$1");
          left.appendChild(photo);
        }
        var right = document.createElement("div");
        right.className = "m-right";
        while (detail.firstChild) right.appendChild(detail.firstChild);
        modalBody.innerHTML = "";
        modalBody.appendChild(left);
        modalBody.appendChild(right);
        document.body.classList.add("modal-open");
        modal.setAttribute("aria-hidden", "false");
      });
    });
    function closeModal() {
      document.body.classList.remove("modal-open");
      modal.setAttribute("aria-hidden", "true");
    }
    modal.querySelector(".member-modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }
})();
