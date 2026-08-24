# MHD Run — Pravidla

> Cíl nových pravidel: organizovat, udělat je míň matoucí a jednodušší pro nové hráče je pochopit. (WIP)

Hra se odehrává mezi dvěma týmy, **běžci** a **chytači**. Běžci znají svůj tajný cílový bod a snaží se k němu dostat. Cestou je mohou zdržovat úkoly a prokletí z karet, zatímco pomocí power-upů mohou naopak zpomalovat chytače. Ti zase znají jejich aktuální polohu, ale nevědí, kam běžci míří, a snaží se je dohnat dřív, než dosáhnou cíle.

## Příprava

**Technika:** Nejprve si stáhni aplikaci **Hauk**, kterou doporučujeme pro sdílení polohy v reálném čase. *(přidat setup instrukce pro Hauk, vytvořit veřejný server — coming soon)*

Poté otevři stránku **mhd-run.vercel.app**, kterou budeš používat pro lízání karet, práci s mincemi, losování cílů a kupování dopravy. Doporučujeme založit skupinový chat, například na WhatsAppu, pro komunikaci v průběhu hry.

**Před začátkem hry:** Hráči se rozdělí do dvou týmů. V týmu běžců jeden hráč nejdříve v aplikaci provede reset (*Nastavení → Resetovat aplikaci*). Potom si vylosují cílovou pozici (*Cíle → Vylosovat cíl*), doporučujeme vzdálenost 5–6 km od startu (lze upravit v nastavení). Jakmile jsou oba týmy připraveny, běžci vyráží. Chytači musí počkat 5 minut, než vyrazí do terénu. Během čekání už ale mohou sledovat polohu běžců a plánovat trasu.

## Průběh hry

### Jak hrát

- **Pohyb:** Hráči využívají MHD (podle toho, co si koupili v obchodě) a vlastní nohy. Tým se nesmí rozdělit.
- **Sledování:** Chytači vidí polohu běžců na trackeru. Běžci mohou tracker dočasně vypnout pomocí power-upů z obchodu.
- **Obchod:** Běžci začínají se **70 🪙**. Za ty si kupují dopravu — platí se **za každou minutu jízdy**, čekání na zastávce je zdarma. Za složitější úkoly mohou získat 💎, ty jsou použity pro nákup powerupů. **Chůze je zdarma** a je to jediný způsob pohybu, při kterém se dají plnit úkoly. Hrajete-li s jinou velikostí hrací plochy, startovní kapitál se škáluje multiplierem.

#### Ceník dopravy (🪙 za minutu jízdy)

| Doprava | 🪙/min | Čím si to platíš |
| --- | --- | --- |
| Metro | 45 | Nejrychlejší a nepřerušitelný tah — ale stanice jsou tam, kde loví chytači |
| Vlak | 40 | Rychlý, když ho chytíš, ale jezdí zřídka — platíš čekáním |
| Bus | 20 | Páteř periferie |
| Tramvaj | 18 | Páteř centra |
| Sdílené kolo | 9 | Jede kamkoli bez čekání, ale je pomalé, vidět a při jízdě neplníš karty |
| Loď | 4 | Sotva rychlejší než chůze a jen po řece — zato skoro zdarma |

Rychlost je luxus. Pomalou dopravu už trestají hodiny, takže ji netrestá i cena — proto je tramvaj i kolo levnější na kilometr než metro.

### Karty (Úkoly a Prokletí)

Kdykoliv běžci nemají aktivní úkol, mohou si líznout novou kartu. Pokud si ji líznou v MHD, začíná platit až po výstupu.

- **Úkol:** Za splnění je odměna. Úkoly lze plnit pouze mimo MHD a vestibuly metra. Úkoly můžete **vetovat**, ale následuje trest.
- **Prokletí:** Postih, který musíte strpět. **Nelze vetovat.**
- **Odměna:** Karta se vyplácí, teprve až ji dokončíš — **nikdy při líznutí**. U prokletí s časovačem to znamená až po jeho doběhnutí: odměnu si zasloužíš tím, že prokletí vydržíš.
- **Trest (4 minuty):** Pokud úkol vetujete nebo porušíte prokletí, nesmíte 4 minuty (nebo 80 % startovního náskoku) používat MHD, nakupovat v obchodě ani lízat další karty. Pokud jste v MHD, musíte co nejdříve vystoupit.

### Powerupy

Běžci si kdykoliv mohou v herním obchodu koupit powerupy. Ty jim mohou dát více peněz, zpomalí chytače, nebo poskytnou informace o chytačích. Některé powerupy vyžadují informovat chytače, to doporučujeme dělat přes skupinový chat.

## Jak vyhrát

### Vítězství běžců

Dorazí do cíle dříve, než je chytači chytí, a pořídí si „vítězné selfie" s cílem.

### Vítězství chytačů

Pořídí fotografii běžců. Pro férovost zde jsou podmínky: fotografie je pořízena bez přibližování, není vyfocena přes sklo a běžci jsou na ní jasně identifikovatelní.

Obě fotografie se posílají do skupinového chatu. Pokud se liší čas pořízení cílové a chytací fotografie, počítá se ta, která byla pořízena dříve.

Po vítězství se role vymění a začíná nové kolo.

## Další varianty

### Chytači taky mají peníze

*(rozvést, zatím jen poznámka)*

Chytači taky mají peníze pro přepravu, ale dostávají pasivní příjem. Když jedou jako skupina, platí jen za skupinu. Můžou se ale rozdělit, pak ale každý platí za sebe. Získají výhodu, ale bude to žrát kredit. Představa jako zrychlení hada ve Slither.io.
