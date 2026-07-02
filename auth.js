// auth.js — подключать первой строкой в <head> на каждой закрытой странице
// Сразу скрываем страницу до проверки токена
document.documentElement.style.visibility = "hidden";

(async function() {
  var WORKER_URL = "https://floral-tree-d2cb.eusjs56999.workers.dev/";
  var token = localStorage.getItem("session_token");

  if (!token) {
    window.location.href = "/main/login.html";
    return;
  }

  // Проверяем токен у Worker
  try {
    var res = await fetch(WORKER_URL + "check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ check: true })
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("session_token");
      window.location.href = "/main/login.html?expired=1";
      return;
    }
  } catch(e) {
    // Если сеть недоступна — пускаем, токен есть локально
    console.warn("Auth check failed, proceeding offline:", e.message);
  }

  // Показываем страницу только после успешной проверки
  document.documentElement.style.visibility = "visible";
})();

// Функция для вызова Gemini через Worker — используй вместо прямого fetch
window.callGemini = async function(prompt, generationConfig) {
  var WORKER_URL = "https://floral-tree-d2cb.eusjs56999.workers.dev/";
  var token = localStorage.getItem("session_token");
  var GEMINI_MODEL = "gemini-2.5-flash";

  if (!token) {
    window.location.href = "/main/login.html";
    throw new Error("Нет токена");
  }

  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, 25000);

  try {
    var res = await fetch(WORKER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { temperature: 0.8 }
      })
    });
    clearTimeout(timer);

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("session_token");
      window.location.href = "/main/login.html?expired=1";
      throw new Error("Сессия истекла");
    }

    var text = await res.text();
    if (!res.ok) {
      var m = "HTTP " + res.status;
      try { m = JSON.parse(text).error.message; } catch(e) {}
      throw new Error(m);
    }

    var data = JSON.parse(text);
    var r = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!r) throw new Error("Tukša atbilde.");
    return r;
  } catch(e) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("Timeout.");
    throw e;
  }
};12345678910111213141516171819202122232425262728293031323334353637383940414243444546474849505152535455565758596061626364656667686970717273747576777879808182838485868788899091// auth.js — подключать первой строкой в <head> на каждой закрытой странице
// Сразу скрываем страницу до проверки токена
document.documentElement.style.visibility = "hidden";


(async function() {
  var WORKER_URL = "https://floral-tree-d2cb.eusjs56999.workers.dev/";
  var token = localStorage.getItem("session_token");


  if (!token) {
    window.location.href = "/main/login.html";
    return;
  }


  // Проверяем токен у Worker
  try {
    var res = await fetch(WORKER_URL + "check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ check: true })
    });


    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("session_token");
      window.location.href = "/main/login.html?expired=1";
      return;
    }
  } catch(e) {
    // Если сеть недоступна — пускаем, токен есть локально
    console.warn("Auth check failed, proceeding offline:", e.message);
  }


  // Показываем страницу только после успешной проверки
  document.documentElement.style.visibility = "visible";
})();


// Функция для вызова Gemini через Worker — используй вместо прямого fetch
window.callGemini = async function(prompt, generationConfig) {
  var WORKER_URL = "https://floral-tree-d2cb.eusjs56999.workers.dev/";
  var token = localStorage.getItem("session_token");
  var GEMINI_MODEL = "gemini-2.5-flash";


  if (!token) {
    window.location.href = "/main/login.html";
    throw new Error("Нет токена");
  }


  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, 25000);


  try {
    var res = await fetch(WORKER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { temperature: 0.8 }
      })
    });
    clearTimeout(timer);


    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("session_token");
      window.location.href = "/main/login.html?expired=1";
      throw new Error("Сессия истекла");
    }


    var text = await res.text();
    if (!res.ok) {
      var m = "HTTP " + res.status;
      try { m = JSON.parse(text).error.message; } catch(e) {}
      throw new Error(m);
    }


    var data = JSON.parse(text);
    var r = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!r) throw new Error("Tukša atbilde.");
    return r;
  } catch(e) {
    clearTimeout(timer);
    if (e.name === "AbortError") throw new Error("Timeout.");
    throw e;
  }
};

// === Полноценный выход: удаляет текущую сессию на сервере, потом чистит localStorage ===
window.logout = async function() {
  var WORKER_URL = "https://floral-tree-d2cb.eusjs56999.workers.dev/";
  var token = localStorage.getItem("session_token");
  if (token) {
    try {
      await fetch(WORKER_URL + "logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({})
      });
    } catch(e) {
      // Даже если сеть недоступна — всё равно чистим локально,
      // чтобы человек не остался залогинен на этом устройстве визуально.
      // Сессия на сервере может остаться активной до истечения TTL (30 дней),
      // но локально человек выйдет корректно.
      console.warn("Logout request failed, clearing local session anyway:", e.message);
    }
  }
  localStorage.removeItem("session_token");
};
