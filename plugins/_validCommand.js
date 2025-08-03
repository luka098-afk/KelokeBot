export async function before(m, { conn }) {
  try {
    if (!m.text || !global.prefix || !global.prefix.test(m.text)) return;

    const Buffer = global.Buffer || ((...args) => new Uint8Array(...args));
    // Tu canal real
    const channelRD = global.channelRD || { id: '120363386229166956@newsletter', name: 'Canal Oficial' };
    const channelLink = 'https://whatsapp.com/channel/0029VawwvsW7j6g1upS0i531';
    const metanombre = global.metanombre || 'Bot';

    if (!Array.prototype.getRandom) {
      Array.prototype.getRandom = function () {
        return this[Math.floor(Math.random() * this.length)];
      };
    }

    global.fkontak = {
      key: {
        participant: `0@s.whatsapp.net`,
        ...(m.chat ? { remoteJid: `status@broadcast` } : {})
      },
      message: {
        contactMessage: {
          displayName: metanombre,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;${metanombre},;;;\nFN:${metanombre}\nitem1.TEL;waid=50231458537:50231458537\nitem1.X-ABLabel:Meta Ai\nitem2.TEL;waid=${m.sender ? m.sender.split('@')[0] : '0'}:${m.sender ? m.sender.split('@')[0] : '0'}\nitem2.X-ABLabel:Usuario\nEND:VCARD`,
          jpegThumbnail: null,
          thumbnail: null,
          sendEphemeral: true
        }
      }
    };

    global.fakeMetaMsg = {
      key: {
        remoteJid: '0@s.whatsapp.net',
        fromMe: false,
        id: 'FFAC1BC46FF49C35',
        participant: '0@s.whatsapp.net'
      },
      message: {
        contactMessage: {
          displayName: 'Bot',
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Meta AI\nORG:Meta AI\nTEL;type=CELL;type=VOICE;waid=50231458537:+502 3145 8537\nEND:VCARD`,
          jpegThumbnail: Buffer.from([]),
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true
          }
        }
      }
    };

    global.rcanal = {
      quoted: global.fakeMetaMsg,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelRD.id,
          serverMessageId: 100,
          newsletterName: channelRD.name
        },
        externalAdReply: {
          title: 'Bot',
          body: 'Sistema de comandos',
          mediaUrl: null,
          description: null,
          previewType: "PHOTO",
          thumbnailUrl: 'http://imgfz.com/i/ysZD3vi.jpeg',
          sourceUrl: '-',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    };

    const usedPrefix = global.prefix.exec(m.text)[0];
    const command = m.text.slice(usedPrefix.length).trim().split(' ')[0].toLowerCase();
    if (!command) return;

    const isValidCommand = (cmd) => {
      return Object.values(global.plugins).some(plugin => {
        if (!plugin.command) return false;
        if (typeof plugin.command === 'function') return plugin.command(cmd);
        if (plugin.command instanceof RegExp) return plugin.command.test(cmd);
        if (Array.isArray(plugin.command)) return plugin.command.map(c => c.toLowerCase()).includes(cmd);
        return plugin.command.toLowerCase() === cmd;
      });
    };

    if (command === "bot") return;

    if (isValidCommand(command)) {
      const chat = global.db.data.chats[m.chat];
      const user = global.db.data.users[m.sender];

      if (chat?.isBanned) {
        const templateButtons = [
          {
            index: 1,
            urlButton: {
              displayText: '📢 Canal',
              url: channelLink
            }
          }
        ];

        const templateMessage = {
          text: `《✦》El bot está desactivado en este grupo.\n\n> ✦ Un *administrador* puede activarlo con:\n» *${usedPrefix}bot on*`,
          footer: 'Únete a nuestro canal oficial',
          templateButtons: templateButtons,
          headerType: 1
        };

        try {
          await conn.sendMessage(m.chat, templateMessage, { quoted: global.fakeMetaMsg });
        } catch (e) {
          // Si fallan los template buttons, usar el método original
          const msg = {
            text: `《✦》El bot está desactivado en este grupo.\n\n> ✦ Un *administrador* puede activarlo con:\n» *${usedPrefix}bot on*\n\n📢 Canal: ${channelLink}`,
            contextInfo: {
              mentionedJid: [m.sender],
              externalAdReply: {
                title: 'Bot Desactivado',
                body: 'Canal',
                thumbnailUrl: 'http://imgfz.com/i/ysZD3vi.jpeg',
                sourceUrl: channelLink,
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          };
          await conn.sendMessage(m.chat, msg, { quoted: global.fakeMetaMsg });
        }
        return;
      }

      if (user) user.commands = (user.commands || 0) + 1;

    } else {
      const comando = m.text.trim().split(' ')[0];
      const templateButtons = [
        {
          index: 1,
          urlButton: {
            displayText: '📢 Canal',
            url: channelLink
          }
        }
      ];

      const templateMessage = {
        text: `《✦》El comando *${comando}* no existe.\nPara ver la lista de comandos usa:\n» *${usedPrefix}help*`,
        footer: 'Únete a nuestro canal oficial',
        templateButtons: templateButtons,
        headerType: 1
      };

      try {
        await conn.sendMessage(m.chat, templateMessage, { quoted: global.fakeMetaMsg });
      } catch (e) {
        // Si fallan los template buttons, usar el método original
        const msg = {
          text: `《✦》El comando *${comando}* no existe.\nPara ver la lista de comandos usa:\n» *${usedPrefix}help*\n\n📢 Canal: ${channelLink}`,
          contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
              title: 'Comando no encontrado',
              body: 'Canal',
              thumbnailUrl: 'http://imgfz.com/i/ysZD3vi.jpeg',
              sourceUrl: channelLink,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        };
        await conn.sendMessage(m.chat, msg, { quoted: global.fakeMetaMsg });
      }
    }
  } catch (error) {
    console.error(`Error en _validCommand.js: ${error}`);
  }
}
