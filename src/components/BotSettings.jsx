import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_FORM = {
  bot_name: "",
  bot_description: "",
  welcome_message: "",
  support_username: "",
  menu_button_text: "",
  menu_button_url: "",
  profile_photo_url: "",
  theme_name: "default",
  is_active: true,
};

export default function BotSettings({ bot, onSaved }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!bot?.id) {
      setLoading(false);
      return;
    }

    loadSettings();
  }, [bot?.id]);

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: settingsError } = await supabase
        .from("bot_customizations")
        .select(
          "id, connected_bot_id, bot_name, bot_description, welcome_message, support_username, menu_button_text, menu_button_url, profile_photo_url, theme_name, is_active"
        )
        .eq("connected_bot_id", bot.id)
        .order("id", { ascending: false })
        .limit(1);

      if (settingsError) {
        throw settingsError;
      }

      const saved = data?.[0];

      if (saved) {
        setForm({
          bot_name: saved.bot_name ?? bot.bot_name ?? "",
          bot_description: saved.bot_description ?? "",
          welcome_message: saved.welcome_message ?? "",
          support_username: saved.support_username ?? "",
          menu_button_text: saved.menu_button_text ?? "",
          menu_button_url: saved.menu_button_url ?? "",
          profile_photo_url: saved.profile_photo_url ?? "",
          theme_name: saved.theme_name ?? "default",
          is_active: saved.is_active ?? true,
        });
      } else {
        setForm({
          ...DEFAULT_FORM,
          bot_name: bot.bot_name ?? "",
          is_active: bot.is_active ?? true,
        });
      }
    } catch (err) {
      console.error("Bot settings load error:", err);
      setError(err.message || "Unable to load bot settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    if (!bot?.id) {
      setError("No connected bot found.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        connected_bot_id: bot.id,
        bot_name: form.bot_name.trim(),
        bot_description: form.bot_description.trim(),
        welcome_message: form.welcome_message.trim(),
        support_username: form.support_username.trim(),
        menu_button_text: form.menu_button_text.trim(),
        menu_button_url: form.menu_button_url.trim(),
        profile_photo_url: form.profile_photo_url.trim(),
        theme_name: form.theme_name,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      const { data: existingRows, error: findError } = await supabase
        .from("bot_customizations")
        .select("id")
        .eq("connected_bot_id", bot.id)
        .order("id", { ascending: false })
        .limit(1);

      if (findError) {
        throw findError;
      }

      const existingId = existingRows?.[0]?.id;

      if (existingId) {
        const { error: updateError } = await supabase
          .from("bot_customizations")
          .update(payload)
          .eq("id", existingId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("bot_customizations")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      const { error: botUpdateError } = await supabase
        .from("connected_bots")
        .update({
          bot_name: form.bot_name.trim() || bot.bot_name,
          is_active: form.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bot.id);

      if (botUpdateError) {
        console.warn("Connected bot update warning:", botUpdateError);
      }

      setSuccess("Bot Settings saved successfully.");

      if (onSaved) {
        onSaved({
          ...bot,
          bot_name: form.bot_name.trim() || bot.bot_name,
          is_active: form.is_active,
        });
      }
    } catch (err) {
      console.error("Bot settings save error:", err);
      setError(err.message || "Unable to save bot settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!bot) {
    return null;
  }

  return (
    <div className="panel-card" style={{ marginTop: "18px" }}>
      <div className="panel-header">
        <div>
          <h2>⚙ Bot Settings</h2>
          <p>
            Manage the connected Telegram bot's name, welcome message,
            support and menu settings.
          </p>
        </div>

        <div
          style={{
            padding: "7px 12px",
            borderRadius: "999px",
            background: form.is_active
              ? "rgba(60, 210, 130, 0.12)"
              : "rgba(255, 70, 70, 0.12)",
            border: form.is_active
              ? "1px solid rgba(60, 210, 130, 0.30)"
              : "1px solid rgba(255, 70, 70, 0.30)",
            color: form.is_active ? "#63e6a1" : "#ff7777",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          {form.is_active ? "● ACTIVE" : "● INACTIVE"}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">◷</div>
          <h3>Loading Bot Settings...</h3>
          <p>Please wait while the saved settings are loaded.</p>
        </div>
      ) : (
        <form
          onSubmit={saveSettings}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label>Bot Name</label>
            <input
              type="text"
              name="bot_name"
              value={form.bot_name}
              onChange={handleChange}
              placeholder="Enter bot name"
            />
          </div>

          <div className="form-group">
            <label>Support Username</label>
            <input
              type="text"
              name="support_username"
              value={form.support_username}
              onChange={handleChange}
              placeholder="@support_username"
            />
          </div>

          <div className="form-group form-full">
            <label>Bot Description</label>
            <input
              type="text"
              name="bot_description"
              value={form.bot_description}
              onChange={handleChange}
              placeholder="Enter bot description"
            />
          </div>

          <div className="form-group form-full">
            <label>Welcome Message</label>
            <textarea
              name="welcome_message"
              value={form.welcome_message}
              onChange={handleChange}
              placeholder="Message shown when users start the bot"
              rows="5"
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label>Menu Button Text</label>
            <input
              type="text"
              name="menu_button_text"
              value={form.menu_button_text}
              onChange={handleChange}
              placeholder="Example: Support"
            />
          </div>

          <div className="form-group">
            <label>Menu Button URL</label>
            <input
              type="url"
              name="menu_button_url"
              value={form.menu_button_url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Profile Photo URL</label>
            <input
              type="url"
              name="profile_photo_url"
              value={form.profile_photo_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select
              name="theme_name"
              value={form.theme_name}
              onChange={handleChange}
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div
            className="form-full"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
            }}
          >
            <input
              id="bot-active-toggle"
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              style={{ width: "18px", height: "18px" }}
            />

            <label
              htmlFor="bot-active-toggle"
              style={{
                margin: 0,
                cursor: "pointer",
              }}
            >
              Bot is active
            </label>
          </div>

          {error && (
            <div
              className="form-full"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(255, 70, 70, 0.10)",
                border: "1px solid rgba(255, 70, 70, 0.30)",
                color: "#ff7777",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="form-full"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(60, 210, 130, 0.10)",
                border: "1px solid rgba(60, 210, 130, 0.30)",
                color: "#63e6a1",
              }}
            >
              {success}
            </div>
          )}

          <div
            className="form-full"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "💾 Save Bot Settings"}
            </button>

            <button
              type="button"
              className="primary-btn"
              onClick={loadSettings}
              disabled={loading || saving}
            >
              ↻ Reload
            </button>
          </div>
        </form>
      )}
    </div>
  );
}