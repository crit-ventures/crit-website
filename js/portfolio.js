// 포트폴리오 그리드 렌더링 + 검색 + 전체/Highlights 보기
(function () {
  var grid = document.getElementById("pfGrid");
  if (!grid || !window.PORTFOLIO) return;

  var lang = document.body.getAttribute("data-lang") === "en" ? "en" : "ko";
  var sectors = lang === "en" ? window.PORTFOLIO_SECTORS_EN : window.PORTFOLIO_SECTORS;
  var assetPrefix = lang === "en" ? "../" : "";

  var state = { q: "", view: "all", sector: "all" };

  function nameOf(c) { return lang === "en" ? (c.ne || c.n) : c.n; }
  function descOf(c) { return lang === "en" ? (c.de || c.d || "") : (c.d || ""); }
  function sectorsOf(c) { return Array.isArray(c.s) ? c.s : [c.s]; }

  // 로고: g에 확장자 있으면 그대로, 없으면 .jpg. 로고 파일이 없으면 회사명 텍스트로 대체
  function logoHTML(c, name) {
    if (!c.g) {
      return '<div class="pf-logo pf-logo--text"><span>' + name + "</span></div>";
    }
    var file = c.g.indexOf(".") > -1 ? c.g : c.g + ".jpg";
    // SVG는 여백 없는 벡터라 래스터 로고(여백 포함 588x400)와 크기를 맞추기 위해 별도 클래스
    var svgCls = /\.svg$/i.test(file) ? " pf-logo--svg" : "";
    // 파일명 기반 개별 클래스(특정 로고 크기 미세조정용)
    var slug = " pf-logo--" + file.replace(/\.[a-z]+$/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return '<div class="pf-logo' + svgCls + slug + '"><img src="' + assetPrefix + "assets/img/portfolio/" + file + '" alt="' + name + '" loading="lazy"></div>';
  }

  function cardHTML(c) {
    var name = nameOf(c);
    var sectorLabel = sectorsOf(c).map(function (k) { return sectors[k] || ""; }).join(" · ");
    var inner =
      logoHTML(c, name) +
      '<div class="pf-over">' +
      '<strong class="pf-name">' + name + "</strong>" +
      '<span class="pf-desc">' + descOf(c) + "</span>" +
      '<span class="pf-sector">' + sectorLabel + "</span>" +
      "</div>";
    if (c.u) {
      return '<a class="pf-card" href="' + c.u + '" target="_blank" rel="noopener">' + inner + "</a>";
    }
    return '<div class="pf-card pf-card--nolink">' + inner + "</div>";
  }

  // 검색 대상: 회사명 + 영문명 + 설명 + 별칭 + 도메인
  function searchText(c) {
    var domain = (c.u || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    return (c.n + " " + (c.ne || "") + " " + (c.d || "") + " " + (c.de || "") + " " + (c.a || "") + " " + domain).toLowerCase();
  }

  function matches(c) {
    if (state.view === "highlights" && !c.hl) return false;
    if (state.sector !== "all" && sectorsOf(c).indexOf(state.sector) === -1) return false;
    if (state.q && searchText(c).indexOf(state.q) === -1) return false;
    return true;
  }

  function render() {
    var list = window.PORTFOLIO.filter(matches);
    // Highlights 보기에서는 지정된 순서(ho)대로 정렬. ho 없으면 뒤로(기존 순서 유지)
    if (state.view === "highlights") {
      list = list.slice().sort(function (a, b) {
        var ao = a.ho == null ? 999 : a.ho;
        var bo = b.ho == null ? 999 : b.ho;
        return ao - bo;
      });
    }
    grid.innerHTML = list.map(cardHTML).join("");
    var countEl = document.getElementById("pfCount");
    if (countEl) countEl.textContent = list.length;
    var empty = document.getElementById("pfEmpty");
    if (empty) empty.style.display = list.length ? "none" : "block";
  }

  var search = document.getElementById("pfSearch");
  var clearBtn = document.getElementById("pfClear");
  function syncClear() {
    if (clearBtn) clearBtn.classList.toggle("on", !!search.value);
  }
  if (search) {
    search.addEventListener("input", function () {
      state.q = search.value.trim().toLowerCase();
      syncClear();
      render();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      search.value = "";
      state.q = "";
      syncClear();
      render();
      search.focus();
    });
  }

  // 전체 / Highlights 보기 전환
  document.querySelectorAll("[data-view]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.view = btn.getAttribute("data-view");
      btn.parentNode.querySelectorAll("[data-view]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      render();
    });
  });

  // 섹터 필터
  document.querySelectorAll("[data-sector]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.sector = btn.getAttribute("data-sector");
      btn.parentNode.querySelectorAll("[data-sector]").forEach(function (b) {
        b.classList.toggle("on", b === btn);
      });
      render();
    });
  });

  render();
})();
