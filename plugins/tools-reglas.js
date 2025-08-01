conn.ev.on('group-participants.update', async (update) => {
  const { id, participants, action } = update;
  if (action === 'add') {
    try {
      const metadata = await conn.groupMetadata(id);
      const reglas = metadata.desc || '📭 *Este grupo no tiene reglas escritas en la descripción.*';
      for (const user of participants) {
        await conn.sendMessage(id, {
          text: `📜 *Reglas del grupo:*\n\n${reglas}`,
          mentions: [user]
        });
      }
    } catch (e) {
      console.error('Error enviando reglas:', e);
    }
  }
});
