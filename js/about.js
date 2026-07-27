// About 페이지: 화면에 보일 때 숫자가 올라가는 카운트업 효과
(function () {
  var nums = document.querySelectorAll(".stat-num");
  if (!nums.length) return;

  // 투자기업 수는 포트폴리오 데이터에서 자동 계산 (기업 추가 시 자동 반영)
  var companyEl = document.getElementById("statCompanies");
  if (companyEl && window.PORTFOLIO && window.PORTFOLIO.length) {
    companyEl.setAttribute("data-target", window.PORTFOLIO.length);
  }

  function animate(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var duration = 1600;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.floor(target * eased).toLocaleString("ko-KR");
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString("ko-KR");
      }
    }
    requestAnimationFrame(step);
  }

  // 화면에 들어올 때 한 번만 실행
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !e.target.dataset.done) {
            e.target.dataset.done = "1";
            animate(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach(function (n) {
      n.textContent = "0";
      io.observe(n);
    });
  } else {
    nums.forEach(animate);
  }
})();
