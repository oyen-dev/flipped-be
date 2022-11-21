
class PresenceService {
  getCurrentPresence (presences) {
    const now = new Date()
    return presences.find((presence) => new Date(presence.end).getTime() > now.getTime()) || null
  }
}

module.exports = {
  PresenceService
}
