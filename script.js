document.addEventListener("DOMContentLoaded", () => {
  const city = "Puttalam";
  const country = "Sri Lanka";
  const method = 3;

  const azanAudio = document.getElementById("azan");

  fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`)
    .then(res => res.json())
    .then(data => {
      const timings = data.data.timings;
      const hijriDate = data.data.date.hijri;
      const gregorian = data.data.date.readable;

      document.getElementById("greg-date").textContent = `Gregorian: ${gregorian}`;
      document.getElementById("hijri-date").textContent = `Hijri: ${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year}`;

      const list = document.getElementById("prayer-times");
      const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const prayerTimes = {};

      prayerOrder.forEach(prayer => {
        const time = timings[prayer];
        prayerTimes[prayer] = time;

        const li = document.createElement("li");
        li.textContent = `${prayer}: ${time}`;
        list.appendChild(li);
      });

      setupNextPrayer(prayerTimes);
    });

  function setupNextPrayer(times) {
    function updateCountdown() {
      const now = new Date();
      let nextName = null;
      let nextTime = null;

      for (let [name, time] of Object.entries(times)) {
        const [h, m] = time.split(":");
        const prayerDate = new Date(now);
        prayerDate.setHours(parseInt(h), parseInt(m), 0, 0);

        if (prayerDate > now) {
          nextName = name;
          nextTime = prayerDate;
          break;
        }
      }

      // If all prayers are passed, set to Fajr tomorrow
      if (!nextTime) {
        nextName = "Fajr";
        const [h, m] = times["Fajr"].split(":");
        nextTime = new Date(now);
        nextTime.setDate(now.getDate() + 1);
        nextTime.setHours(parseInt(h), parseInt(m), 0, 0);
      }

      const countdown = Math.floor((nextTime - now) / 1000);
      const hours = String(Math.floor(countdown / 3600)).padStart(2, '0');
      const mins = String(Math.floor((countdown % 3600) / 60)).padStart(2, '0');
      const secs = String(countdown % 60).padStart(2, '0');

      document.getElementById("next-prayer").textContent =
        `Next: ${nextName} in ${hours}:${mins}:${secs}`;

      // Play Azan at exact time
      if (countdown === 0) {
        azanAudio.play();
      }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
});
