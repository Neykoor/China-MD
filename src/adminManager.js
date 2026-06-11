import NodeCache from "node-cache";
import { jidNormalizedUser } from "@itsliaaa/baileys";

const participantCache = new NodeCache({ stdTTL: 1800, checkperiod: 300, useClones: false });
const botFacesCache    = new NodeCache({ stdTTL: 3600, useClones: false });

const _fetchingGroups = new Map();

function toNumber(jid) {
  return jidNormalizedUser(jid).split("@")[0];
}

function addBothForms(set, jid) {
  if (!jid) return;
  const normalized = jidNormalizedUser(jid);
  set.add(normalized);
  set.add(normalized.split("@")[0]);
}

async function fetchParticipants(sock, jid) {
  let participants = participantCache.get(jid);
  if (participants) return participants;

  if (_fetchingGroups.has(jid)) return _fetchingGroups.get(jid);

  const promise = (async () => {
    try {
      const metadata = await sock.groupMetadata(jid);
      const result = (metadata.participants || []).map((p) => ({
        ...p,
        realJid: jidNormalizedUser(p.id),
      }));
      participantCache.set(jid, result);
      return result;
    } catch {
      return [];
    } finally {
      _fetchingGroups.delete(jid);
    }
  })();

  _fetchingGroups.set(jid, promise);
  return promise;
}

async function getBotFaces(sock) {
  const mainId = sock.user?.id ? jidNormalizedUser(sock.user.id) : "default";
  const cached = botFacesCache.get(mainId);
  if (cached) return cached;

  const faces = new Set();
  if (sock.user?.id) addBothForms(faces, sock.user.id);
  if (sock.user?.lid) addBothForms(faces, sock.user.lid);

  if (sock.lid?.resolve) {
    if (sock.user?.lid) {
      const r = await sock.lid.resolve(sock.user.lid).catch(() => null);
      addBothForms(faces, r);
    }
    if (sock.user?.id?.includes("@lid")) {
      const r = await sock.lid.resolve(sock.user.id).catch(() => null);
      addBothForms(faces, r);
    }
  }

  botFacesCache.set(mainId, faces);
  return faces;
}

export const adminManager = {
  isAdmin: async (sock, jid, userJid) => {
    if (!jid || !userJid) return false;
    try {
      const participants = await fetchParticipants(sock, jid);
      const userFaces = new Set();
      addBothForms(userFaces, userJid);

      for (const p of participants) {
        if (p.admin !== "admin" && p.admin !== "superadmin") continue;
        if (userFaces.has(p.id) || userFaces.has(p.id.split("@")[0])) return true;
        if (userFaces.has(p.realJid) || userFaces.has(toNumber(p.realJid))) return true;
      }

      if (userJid.includes("@lid") && sock.lid?.resolve) {
        const resolved = await sock.lid.resolve(userJid).catch(() => null);
        if (resolved) {
          const resNumber = toNumber(resolved);
          const p = participants.find((p) => toNumber(p.realJid) === resNumber);
          return p?.admin === "admin" || p?.admin === "superadmin";
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  isBotAdmin: async (sock, jid) => {
    if (!jid) return false;
    try {
      const [participants, botFaces] = await Promise.all([
        fetchParticipants(sock, jid),
        getBotFaces(sock),
      ]);

      for (const p of participants) {
        if (p.admin !== "admin" && p.admin !== "superadmin") continue;
        if (botFaces.has(p.id) || botFaces.has(p.id.split("@")[0])) return true;
        if (botFaces.has(p.realJid) || botFaces.has(toNumber(p.realJid))) return true;
      }

      const botId = sock.user?.id ? jidNormalizedUser(sock.user.id) : null;
      if (botId && sock.lid?.resolveBatch) {
        const adminLids = participants
          .filter(
            (p) =>
              (p.admin === "admin" || p.admin === "superadmin") &&
              p.id.includes("@lid")
          )
          .map((p) => p.id);
        if (adminLids.length > 0) {
          try {
            const resolvedMap = await sock.lid.resolveBatch(adminLids);
            for (const [, resolved] of resolvedMap) {
              if (resolved && jidNormalizedUser(resolved) === botId) return true;
            }
          } catch {}
        }
      }

      return false;
    } catch {
      return false;
    }
  },

  isSuperAdmin: async (sock, jid, participant) => {
    try {
      const participants = await fetchParticipants(sock, jid);
      let realParticipant = participant;
      if (sock.lid?.resolve && participant.includes("@lid")) {
        const resolved = await sock.lid.resolve(participant).catch(() => null);
        if (resolved) realParticipant = resolved;
      }
      const participantNumber = toNumber(realParticipant);
      const p = participants.find((p) => toNumber(p.realJid) === participantNumber);
      return p?.admin === "superadmin";
    } catch {
      return false;
    }
  },

  invalidate: (jid) => {
    participantCache.del(jid);
  },

  invalidateAll: () => {
    botFacesCache.flushAll();
    participantCache.flushAll();
  },
};
