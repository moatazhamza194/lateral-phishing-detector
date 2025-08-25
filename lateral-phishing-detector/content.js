(() => {
  const icon = (name, color = "#333") =>
    `<span class="material-icons" style="color:${color}; vertical-align: middle;">${name}</span>`;

  const emailData = {
    from: document.querySelector('.sender-row strong')?.innerText || '(No sender)',
    to: document.querySelector('#email-details p:nth-child(2)')?.innerText.replace('to:', '').trim() || '(No recipient)',
    date: document.querySelector('#email-details p:nth-child(3)')?.innerText.replace('date:', '').trim() || '(No date)',
    subject: document.querySelector(".subject")?.innerText || "no subject",
    body: document.querySelector(".email-body")?.innerText || "no body",
    receiver_name: document.querySelector(".receiver-name")?.innerText.replace('to', '').trim() || "no name",
  };

  fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailData)
  })
    .then(res => res.json())
    .then(data => {
      if (!data || data.label !== 1) return;

      const senderEmail = emailData.from;
      const domain = data.domain;
      const receiver_name = emailData.receiver_name;

      const backdrop = document.createElement("div");
      backdrop.className = "phish-overlay-backdrop";
      document.body.appendChild(backdrop);

      const modal = document.createElement("div");
      modal.className = "phish-overlay-modal";
      document.body.appendChild(modal);

      

      const userAnswers = {};

      const askQuestions = [
        {
          key: "senderKnown",
          icon: icon("person"),
          question: `Hey <b>${receiver_name}</b>, do you usually get emails from <b>${senderEmail}</b>?`
        },
        {
          key: "volumeNormal",
          icon: icon("groups"),
          question: `Does it make sense for this message to be sent to ${data.features_used.NumRecipients} people?`
        },
        {
          key: "domainFamiliar",
          icon: icon("language"),
          question: `Is the domain <b>${domain}</b> familiar to you?`
        }
      ];

      let current = 0;

      const renderQuestion = () => {
        const q = askQuestions[current];
        const progressPercent = ((current + 1) / askQuestions.length) * 100;

        const isSecondQuestion = current === 1;

        const censorLinks = (text) => {
          const urlRegex = /https?:\/\/[^\s)>\],;]+[^\s)>\],;.!?]/gi;
          return text.replace(urlRegex, "[link censored]");
        };

        modal.innerHTML = `
          <h2 style="margin-bottom: 12px;">${icon("warning", "#fbbc04")} Quick Security Check</h2>

          <div style="background: #eee; border-radius: 3px; overflow: hidden; margin-bottom: 6px; height: 4px;">
            <div style="width:${progressPercent}%; background: #8ab4f8; height: 4px; transition: width 0.3s;"></div>
          </div>
          <p style="font-size: 12px; color: #555; margin-bottom: 12px;">Question ${current + 1} of ${askQuestions.length}</p>

          <div style="display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap;">
            <p style="flex: 1 1 300px;">${q.icon} ${q.question}</p>
            ${
              isSecondQuestion
                ? `<pre class="nocopy" style="
                    flex: 1 1 300px;
                    max-height: 150px;
                    overflow-y: auto;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 12px;
                    font-family: monospace;
                    font-size: 13px;
                    box-shadow: 0 0 6px rgba(0,0,0,0.1);
                    white-space: pre-wrap;
                    word-wrap: break-word;
                  ">${censorLinks(emailData.body)}</pre>`
                : ''
            }
          </div>

          <div style="margin-top: 16px;">
            <button class="btn answer" data-value="yes">${icon("check_circle", "green")} Yes</button>
            <button class="btn answer" data-value="no">${icon("cancel", "red")} No</button>
            <button class="btn answer" data-value="unsure">${icon("help", "#fbbc04")} Not sure</button>
          </div>
        `;
        hookResponses();
      };

      const hookResponses = () => {
        modal.querySelectorAll(".answer").forEach(btn => {
          btn.addEventListener("click", () => {
            const key = askQuestions[current].key;
            userAnswers[key] = btn.dataset.value;
            current++;
            if (current < askQuestions.length) {
              renderQuestion();
            } else {
              showSummary();
            }
          });
        });
      };

      const showSummary = () => {
        const statements = [];

        if (userAnswers.senderKnown === "no") {
          statements.push(`${icon("cancel", "red")} You don’t usually get emails from <b>${senderEmail}</b>`);
        } else if (userAnswers.senderKnown === "unsure") {
          statements.push(`${icon("help", "#fbbc04")} Not sure about the sender <b>${senderEmail}</b>`);
        }

        if (userAnswers.volumeNormal === "no") {
          statements.push(`${icon("groups", "red")} This message was sent to many people unexpectedly`);
        } else if (userAnswers.volumeNormal === "unsure") {
          statements.push(`${icon("groups", "#fbbc04")} Not sure about the recipient volume`);
        }

        if (userAnswers.domainFamiliar === "no") {
          statements.push(`${icon("language", "red")} The domain <b>${domain}</b> is unfamiliar`);
        } else if (userAnswers.domainFamiliar === "unsure") {
          statements.push(`${icon("language", "#fbbc04")} Not sure about the domain <b>${domain}</b>`);
        }

        modal.innerHTML = `
          <h2 style="color: #d93025;">${icon("report_problem", "#d93025")} Potential Risk Identified</h2>
          <div class="summary-box">
            ${statements.map(s => `<p>${s}</p>`).join("")}
          </div>
          <div class="action-buttons">
            <button class="btn btn--verify">${icon("search", "#1a73e8")} Verify with Sender</button>
            <button class="btn btn--report">${icon("flag", "#ea8600")} Report to Security</button>
            <button class="btn btn--proceed">${icon("warning_amber", "#d93025")} Proceed Anyway</button>
          </div>
        `;

        modal.querySelector(".btn--verify").addEventListener("click", () => {
          alert("Verify with sender triggered.");
        });
        modal.querySelector(".btn--report").addEventListener("click", () => {
          alert("Reported to security.");
        });
        modal.querySelector(".btn--proceed").addEventListener("click", () => {
          backdrop.remove();
          modal.remove();
        });
      };

      renderQuestion();
    })
    .catch(err => console.error("Phishing check error:", err));
})();
