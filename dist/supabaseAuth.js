// Aily Supabase Authentication & Sync Module
// Seamlessly connects with Supabase Auth (Email/Password) and user_progress table

(function() {
  const DEFAULT_CONFIG = {
    url: window.AILY_CONFIG?.supabaseUrl || localStorage.getItem('aily_sb_url') || '',
    anonKey: window.AILY_CONFIG?.supabaseAnonKey || localStorage.getItem('aily_sb_key') || ''
  };

  let client = null;

  function isMissingSession(error) {
    return error?.name === 'AuthSessionMissingError' || error?.message === 'Auth session missing!';
  }

  function initSupabase() {
    if (window.supabase && DEFAULT_CONFIG.url && DEFAULT_CONFIG.anonKey) {
      try {
        client = window.supabase.createClient(DEFAULT_CONFIG.url, DEFAULT_CONFIG.anonKey);
        // Listen to auth events
        client.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            window.userAccount = session.user;
            if (typeof account !== 'undefined') {
              account = { email: session.user.email, id: session.user.id };
              syncState = 'synced';
              if (typeof headerAccount === 'function') headerAccount();
            }
            await loadSupabaseProgress();
          } else {
            window.userAccount = null;
            if (typeof account !== 'undefined' && syncState !== 'guest') {
              account = null;
              syncState = 'guest';
              if (typeof headerAccount === 'function') headerAccount();
            }
          }
          if (location.hash === '#account' && typeof accountPage === 'function') {
            accountPage();
          }
        });
      } catch (e) {
        console.warn('Could not initialize Supabase client:', e);
      }
    }
  }

  async function loadSupabaseProgress() {
    if (!client) return [];
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError && !isMissingSession(userError)) throw userError;
    if (!user) return [];
    const { data, error } = await client
      .from('user_progress')
      .select('activity_id, completed_at')
      .eq('user_id', user.id)
      .order('completed_at');
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    if (typeof completed !== 'undefined') {
      for (const row of rows) {
        if (!completed.includes(row.activity_id)) completed.push(row.activity_id);
      }
    }
    return rows;
  }

  window.AilyAuth = {
    isConfigured() {
      return Boolean(DEFAULT_CONFIG.url && DEFAULT_CONFIG.anonKey && client);
    },
    setConfig(url, key) {
      DEFAULT_CONFIG.url = url.trim();
      DEFAULT_CONFIG.anonKey = key.trim();
      localStorage.setItem('aily_sb_url', DEFAULT_CONFIG.url);
      localStorage.setItem('aily_sb_key', DEFAULT_CONFIG.anonKey);
      initSupabase();
    },
    getConfig() {
      return { ...DEFAULT_CONFIG };
    },
    getClient() {
      return client;
    },
    async getUser() {
      if (!client) return null;
      const { data: { user }, error } = await client.auth.getUser();
      if (error && !isMissingSession(error)) throw error;
      return user;
    },
    loadProgress() {
      return loadSupabaseProgress();
    },
    async signUp(email, password) {
      if (!client) throw new Error('Please configure your Supabase URL & Anon Key first.');
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      if (!client) throw new Error('Please configure your Supabase URL & Anon Key first.');
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (client) {
        await client.auth.signOut();
      }
      localStorage.removeItem('aily_sb_token');
      if (typeof account !== 'undefined') {
        account = null;
        syncState = 'guest';
        if (typeof headerAccount === 'function') headerAccount();
      }
    },
    async saveProgress(activityId) {
      if (!client) return false;
      try {
        const { data: { user } } = await client.auth.getUser();
        if (!user) return false;
        const { error } = await client.from('user_progress').upsert({
          user_id: user.id,
          activity_id: activityId,
          completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,activity_id' });
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Could not save to Supabase:', err);
        return false;
      }
    }
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
  } else {
    initSupabase();
  }
})();
