import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { openCookieSettings } from '@/hooks/use-privacy-choices';
import { useTranslation } from '@/hooks/use-translation';
import { home } from '@/routes';

type Props = {
    operator: Partial<
        Record<'name' | 'address' | 'company_id' | 'email', string>
    >;
    updatedAt: string;
};

type Section = {
    id: string;
    title: string;
    paragraphs?: string[];
    items?: string[];
};

type Copy = {
    title: string;
    back: string;
    updated: string;
    operatorTitle: string;
    operatorIntro: string;
    operatorLabels: Record<'name' | 'address' | 'company_id' | 'email', string>;
    sections: Section[];
    cookieTable: { head: string[]; rows: string[][] };
    cookieSettings: string;
};

const content: Record<string, Copy> = {
    sk: {
        title: 'Ochrana osobných údajov a cookies',
        back: 'Späť na úvod',
        updated: 'Naposledy aktualizované',
        operatorTitle: 'Kto údaje spracúva',
        operatorIntro:
            'Prevádzkovateľom osobných údajov v službe RackAtlas je:',
        operatorLabels: {
            name: 'Prevádzkovateľ',
            address: 'Adresa',
            company_id: 'IČO',
            email: 'Kontakt',
        },
        cookieSettings: 'Zmeniť nastavenia cookies',
        sections: [
            {
                id: 'data',
                title: 'Aké údaje spracúvame a prečo',
                items: [
                    'Účet: meno, e-mail, heslo (ukladá sa len ako hash), nastavenia dvojfázového overenia, passkeys a zvolený jazyk. Účel: vytvorenie a prevádzka účtu. Právny základ: plnenie zmluvy (čl. 6 ods. 1 písm. b GDPR).',
                    'Servery a monitoring: názov servera a údaje, ktoré pošle agent: využitie CPU, pamäte a diskov, stav služieb a kritické záznamy z logov. Účel: poskytovanie monitoringu a upozornení. Právny základ: plnenie zmluvy. Záznamy z logov môžu obsahovať osobné údaje; agent posiela len vážne chyby.',
                    'Zariadenia a bezpečnosť: IP adresa, typ prehliadača a zariadenia, čas poslednej aktivity a identifikátor zariadenia. Účel: zoznam prihlásených zariadení, ich odhlásenie a ochrana pred zneužitím účtu. Právny základ: oprávnený záujem na bezpečnosti (čl. 6 ods. 1 písm. f GDPR).',
                    'Upozornenia: e-mailová adresa a, ak ich zapneš, registrácia zariadenia pre push notifikácie. Právny základ: plnenie zmluvy; push notifikácie navyše povoľuješ v prehliadači ty.',
                    'Ochrana formulárov: pri prihlásení a registrácii overuje, že ide o človeka, služba Cloudflare Turnstile. Právny základ: oprávnený záujem na ochrane pred automatizovaným zneužitím.',
                ],
            },
            {
                id: 'recipients',
                title: 'Komu údaje sprístupňujeme',
                paragraphs: [
                    'Údaje nepredávame a nepoužívame ich na reklamu ani profilovanie. Spracúvajú ich len poskytovatelia, ktorých potrebujeme na chod služby: poskytovateľ hostingu, poskytovateľ odosielania e-mailov (Brevo) a Cloudflare (Turnstile). Ak niektorý z nich spracúva údaje mimo EÚ/EHP, deje sa to na základe primeraných záruk podľa kapitoly V GDPR (rozhodnutie o primeranosti alebo štandardné zmluvné doložky).',
                ],
            },
            {
                id: 'retention',
                title: 'Ako dlho údaje uchovávame',
                paragraphs: [
                    'Údaje účtu a serverov uchovávame, kým účet existuje. Po vymazaní servera alebo účtu sa príslušné údaje odstránia. Odhlásené zariadenia sa z evidencie odstránia po 90 dňoch.',
                ],
            },
            {
                id: 'cookies',
                title: 'Cookies',
                paragraphs: [
                    'Nevyhnutné cookies potrebujeme na fungovanie stránky a súhlas na ne nepýtame. Preferenčné cookies (zapamätanie jazyka a vzhľadu) si trvalo uložíme len s tvojím súhlasom. Bez súhlasu platia len do zatvorenia prehliadača. Nepoužívame reklamné ani analytické cookies. Tvoju voľbu si pamätáme v úložisku prehliadača (localStorage), nie na serveri.',
                ],
            },
            {
                id: 'rights',
                title: 'Tvoje práva',
                paragraphs: [
                    'Máš právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a právo namietať proti spracúvaniu na základe oprávneného záujmu. Súhlas môžeš kedykoľvek odvolať, odvolanie nemá vplyv na zákonnosť spracúvania pred ním. Uplatníš ich na kontakte vyššie, odpovieme do 30 dní. Máš tiež právo podať sťažnosť dozornému orgánu, na Slovensku je to Úrad na ochranu osobných údajov SR (dataprotection.gov.sk), alebo orgánu vo svojej krajine.',
                ],
            },
            {
                id: 'security',
                title: 'Zabezpečenie',
                paragraphs: [
                    'Komunikácia prebieha cez HTTPS, heslá sa ukladajú ako hash, prihlásenie môžeš chrániť dvojfázovým overením alebo passkey a agenta inštaluješ z podpísaného repozitára. Údaje z agenta chránime tokenom, ktorý patrí len jednému serveru.',
                ],
            },
            {
                id: 'changes',
                title: 'Zmeny',
                paragraphs: [
                    'Tento dokument môžeme upraviť. Dátum poslednej zmeny je uvedený hore. O podstatných zmenách ťa budeme informovať.',
                ],
            },
        ],
        cookieTable: {
            head: ['Cookie', 'Účel', 'Platnosť', 'Druh'],
            rows: [
                [
                    '*-session',
                    'Relácia a prihlásenie',
                    '2 hodiny, predlžuje sa pri aktivite',
                    'Nevyhnutné',
                ],
                [
                    'XSRF-TOKEN',
                    'Ochrana formulárov pred falšovaním požiadaviek',
                    '2 hodiny, predlžuje sa pri aktivite',
                    'Nevyhnutné',
                ],
                [
                    'ra_device',
                    'Rozpoznanie zariadenia po prihlásení, jeho zoznam a odhlásenie',
                    '5 rokov',
                    'Nevyhnutné (len po prihlásení)',
                ],
                [
                    'remember_web_*',
                    'Zostať prihlásený, ak to zvolíš',
                    '400 dní',
                    'Nevyhnutné (len ak to zvolíš)',
                ],
                [
                    'locale',
                    'Zvolený jazyk',
                    '400 dní so súhlasom, inak do zatvorenia prehliadača',
                    'Preferencie',
                ],
                [
                    'appearance, sidebar_state',
                    'Vzhľad (svetlý/tmavý) a stav bočného panela',
                    'So súhlasom: appearance 1 rok, sidebar_state 7 dní. Inak do zatvorenia prehliadača',
                    'Preferencie',
                ],
                [
                    'Cloudflare Turnstile',
                    'Overenie človeka pri prihlásení a registrácii (nie na úvodnej stránke)',
                    'Podľa Cloudflare',
                    'Nevyhnutné (bezpečnosť)',
                ],
            ],
        },
    },
    cs: {
        title: 'Ochrana osobních údajů a cookies',
        back: 'Zpět na úvod',
        updated: 'Naposledy aktualizováno',
        operatorTitle: 'Kdo údaje zpracovává',
        operatorIntro: 'Správcem osobních údajů ve službě RackAtlas je:',
        operatorLabels: {
            name: 'Správce',
            address: 'Adresa',
            company_id: 'IČO',
            email: 'Kontakt',
        },
        cookieSettings: 'Změnit nastavení cookies',
        sections: [
            {
                id: 'data',
                title: 'Jaké údaje zpracováváme a proč',
                items: [
                    'Účet: jméno, e-mail, heslo (ukládá se jen jako hash), nastavení dvoufázového ověření, passkeys a zvolený jazyk. Účel: vytvoření a provoz účtu. Právní základ: plnění smlouvy (čl. 6 odst. 1 písm. b GDPR).',
                    'Servery a monitoring: název serveru a údaje, které pošle agent: využití CPU, paměti a disků, stav služeb a kritické záznamy z logů. Účel: poskytování monitoringu a upozornění. Právní základ: plnění smlouvy. Záznamy z logů mohou obsahovat osobní údaje; agent posílá jen vážné chyby.',
                    'Zařízení a bezpečnost: IP adresa, typ prohlížeče a zařízení, čas poslední aktivity a identifikátor zařízení. Účel: seznam přihlášených zařízení, jejich odhlášení a ochrana před zneužitím účtu. Právní základ: oprávněný zájem na bezpečnosti (čl. 6 odst. 1 písm. f GDPR).',
                    'Upozornění: e-mailová adresa a, pokud je zapneš, registrace zařízení pro push notifikace. Právní základ: plnění smlouvy; push notifikace navíc povolujete v prohlížeči vy.',
                    'Ochrana formulářů: při přihlášení a registraci ověřuje, že jde o člověka, služba Cloudflare Turnstile. Právní základ: oprávněný zájem na ochraně před automatizovaným zneužitím.',
                ],
            },
            {
                id: 'recipients',
                title: 'Komu údaje zpřístupňujeme',
                paragraphs: [
                    'Údaje neprodáváme a nepoužíváme je k reklamě ani profilování. Zpracovávají je jen poskytovatelé, které potřebujeme k chodu služby: poskytovatel hostingu, poskytovatel odesílání e-mailů (Brevo) a Cloudflare (Turnstile). Pokud některý z nich zpracovává údaje mimo EU/EHP, děje se to na základě vhodných záruk podle kapitoly V GDPR (rozhodnutí o odpovídající ochraně nebo standardní smluvní doložky).',
                ],
            },
            {
                id: 'retention',
                title: 'Jak dlouho údaje uchováváme',
                paragraphs: [
                    'Údaje účtu a serverů uchováváme, dokud účet existuje. Po smazání serveru nebo účtu se příslušné údaje odstraní. Odhlášená zařízení se z evidence odstraní po 90 dnech.',
                ],
            },
            {
                id: 'cookies',
                title: 'Cookies',
                paragraphs: [
                    'Nezbytné cookies potřebujeme k fungování stránky a souhlas k nim nežádáme. Preferenční cookies (zapamatování jazyka a vzhledu) uložíme trvale jen s tvým souhlasem. Bez souhlasu platí jen do zavření prohlížeče. Nepoužíváme reklamní ani analytické cookies. Tvou volbu si pamatujeme v úložišti prohlížeče (localStorage), ne na serveru.',
                ],
            },
            {
                id: 'rights',
                title: 'Tvá práva',
                paragraphs: [
                    'Máš právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost a právo vznést námitku proti zpracování na základě oprávněného zájmu. Souhlas můžeš kdykoli odvolat, odvolání nemá vliv na zákonnost zpracování před ním. Uplatníš je na kontaktu výše, odpovíme do 30 dnů. Máš také právo podat stížnost u dozorového úřadu, v Česku je to Úřad pro ochranu osobních údajů (uoou.cz), případně u úřadu ve své zemi.',
                ],
            },
            {
                id: 'security',
                title: 'Zabezpečení',
                paragraphs: [
                    'Komunikace probíhá přes HTTPS, hesla se ukládají jako hash, přihlášení můžeš chránit dvoufázovým ověřením nebo passkey a agenta instaluješ z podepsaného repozitáře. Data z agenta chráníme tokenem, který patří jen jednomu serveru.',
                ],
            },
            {
                id: 'changes',
                title: 'Změny',
                paragraphs: [
                    'Tento dokument můžeme upravit. Datum poslední změny je uvedeno nahoře. O podstatných změnách tě budeme informovat.',
                ],
            },
        ],
        cookieTable: {
            head: ['Cookie', 'Účel', 'Platnost', 'Druh'],
            rows: [
                [
                    '*-session',
                    'Relace a přihlášení',
                    '2 hodiny, prodlužuje se při aktivitě',
                    'Nezbytné',
                ],
                [
                    'XSRF-TOKEN',
                    'Ochrana formulářů před padělanými požadavky',
                    '2 hodiny, prodlužuje se při aktivitě',
                    'Nezbytné',
                ],
                [
                    'ra_device',
                    'Rozpoznání zařízení po přihlášení, jeho seznam a odhlášení',
                    '5 let',
                    'Nezbytné (jen po přihlášení)',
                ],
                [
                    'remember_web_*',
                    'Zůstat přihlášen, pokud to zvolíš',
                    '400 dní',
                    'Nezbytné (jen pokud to zvolíš)',
                ],
                [
                    'locale',
                    'Zvolený jazyk',
                    '400 dní se souhlasem, jinak do zavření prohlížeče',
                    'Preference',
                ],
                [
                    'appearance, sidebar_state',
                    'Vzhled (světlý/tmavý) a stav bočního panelu',
                    'Se souhlasem: appearance 1 rok, sidebar_state 7 dní. Jinak do zavření prohlížeče',
                    'Preference',
                ],
                [
                    'Cloudflare Turnstile',
                    'Ověření člověka při přihlášení a registraci (ne na úvodní stránce)',
                    'Podle Cloudflare',
                    'Nezbytné (bezpečnost)',
                ],
            ],
        },
    },
    en: {
        title: 'Privacy and cookies',
        back: 'Back to home',
        updated: 'Last updated',
        operatorTitle: 'Who processes your data',
        operatorIntro: 'The controller of personal data in RackAtlas is:',
        operatorLabels: {
            name: 'Controller',
            address: 'Address',
            company_id: 'Company ID',
            email: 'Contact',
        },
        cookieSettings: 'Change cookie settings',
        sections: [
            {
                id: 'data',
                title: 'What data we process and why',
                items: [
                    'Account: name, email, password (stored only as a hash), two-factor and passkey settings and your language. Purpose: creating and running your account. Legal basis: performance of a contract (Art. 6(1)(b) GDPR).',
                    'Servers and monitoring: the server name and what the agent sends: CPU, memory and disk usage, service status and critical log entries. Purpose: providing monitoring and alerts. Legal basis: performance of a contract. Log entries may contain personal data; the agent only sends serious errors.',
                    'Devices and security: IP address, browser and device type, last activity and a device identifier. Purpose: the list of signed-in devices, signing them out and protecting your account from abuse. Legal basis: legitimate interest in security (Art. 6(1)(f) GDPR).',
                    'Alerts: your email address and, if you turn it on, a device registration for push notifications. Legal basis: performance of a contract; you also allow push notifications in your browser.',
                    'Form protection: Cloudflare Turnstile checks that a visitor is human when signing in or registering. Legal basis: legitimate interest in protection from automated abuse.',
                ],
            },
            {
                id: 'recipients',
                title: 'Who receives the data',
                paragraphs: [
                    'We do not sell data and do not use it for advertising or profiling. Only providers we need to run the service process it: the hosting provider, the email delivery provider (Brevo) and Cloudflare (Turnstile). If any of them processes data outside the EU/EEA, it happens under appropriate safeguards under Chapter V GDPR (an adequacy decision or standard contractual clauses).',
                ],
            },
            {
                id: 'retention',
                title: 'How long we keep data',
                paragraphs: [
                    'We keep account and server data while your account exists. When you delete a server or the account, the related data is removed. Revoked devices are removed from the list after 90 days.',
                ],
            },
            {
                id: 'cookies',
                title: 'Cookies',
                paragraphs: [
                    'We need necessary cookies for the site to work and do not ask for consent for them. Preference cookies (remembering language and appearance) are stored long-term only with your consent. Without consent they last until you close the browser. We use no advertising or analytics cookies. Your choice is remembered in the browser storage (localStorage), not on the server.',
                ],
            },
            {
                id: 'rights',
                title: 'Your rights',
                paragraphs: [
                    'You have the right of access, rectification, erasure, restriction, portability and the right to object to processing based on legitimate interest. You can withdraw consent at any time; withdrawal does not affect processing before it. Use the contact above and we will answer within 30 days. You may also complain to a supervisory authority, in Slovakia the Office for Personal Data Protection (dataprotection.gov.sk), or the authority in your country.',
                ],
            },
            {
                id: 'security',
                title: 'Security',
                paragraphs: [
                    'Traffic uses HTTPS, passwords are stored as hashes, you can protect sign-in with two-factor authentication or a passkey and you install the agent from a signed repository. Agent data is protected by a token that belongs to a single server.',
                ],
            },
            {
                id: 'changes',
                title: 'Changes',
                paragraphs: [
                    'We may update this document. The date of the last change is shown above. We will tell you about material changes.',
                ],
            },
        ],
        cookieTable: {
            head: ['Cookie', 'Purpose', 'Lifetime', 'Type'],
            rows: [
                [
                    '*-session',
                    'Session and sign-in',
                    '2 hours, renewed while you are active',
                    'Necessary',
                ],
                [
                    'XSRF-TOKEN',
                    'Protects forms from forged requests',
                    '2 hours, renewed while you are active',
                    'Necessary',
                ],
                [
                    'ra_device',
                    'Recognises the device after sign-in, lists and signs it out',
                    '5 years',
                    'Necessary (signed-in only)',
                ],
                [
                    'remember_web_*',
                    'Keeps you signed in if you choose so',
                    '400 days',
                    'Necessary (only if you choose so)',
                ],
                [
                    'locale',
                    'Chosen language',
                    '400 days with consent, otherwise until the browser closes',
                    'Preferences',
                ],
                [
                    'appearance, sidebar_state',
                    'Appearance (light/dark) and sidebar state',
                    'With consent: appearance 1 year, sidebar_state 7 days. Otherwise until the browser closes',
                    'Preferences',
                ],
                [
                    'Cloudflare Turnstile',
                    'Human check when signing in and registering (not on the home page)',
                    'Set by Cloudflare',
                    'Necessary (security)',
                ],
            ],
        },
    },
};

export default function Privacy({ operator, updatedAt }: Props) {
    const { locale } = useTranslation();
    const copy = content[locale] ?? content.en;
    const operatorKeys = ['name', 'address', 'company_id', 'email'] as const;

    useEffect(() => {
        document.documentElement.classList.add('smooth-anchors');

        return () =>
            document.documentElement.classList.remove('smooth-anchors');
    }, []);

    return (
        <>
            <Head title={copy.title} />
            <div className="landing min-h-dvh bg-[var(--l-bg)] text-[16px] leading-relaxed text-[var(--l-ink)]">
                <main className="mx-auto max-w-[760px] px-4 py-10 sm:px-8 sm:py-16">
                    <Link
                        href={home()}
                        className="text-sm text-[var(--l-muted)] underline-offset-4 hover:text-[var(--l-ink)] hover:underline"
                    >
                        ← {copy.back}
                    </Link>
                    <h1 className="mt-6 mb-2 text-[clamp(2rem,4vw,2.8rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
                        {copy.title}
                    </h1>
                    <p className="mb-10 text-sm text-[var(--l-muted)]">
                        {copy.updated}: {updatedAt}
                    </p>

                    <section className="mb-10">
                        <h2 className="mb-3 text-[22px] font-semibold tracking-tight">
                            {copy.operatorTitle}
                        </h2>
                        <p className="mb-3 text-[var(--l-body)]">
                            {copy.operatorIntro}
                        </p>
                        <dl className="grid gap-x-6 gap-y-1 text-[var(--l-body)] sm:grid-cols-[9rem_1fr]">
                            {operatorKeys
                                .filter((key) => operator[key])
                                .map((key) => (
                                    <div key={key} className="contents">
                                        <dt className="font-medium text-[var(--l-ink)]">
                                            {copy.operatorLabels[key]}
                                        </dt>
                                        <dd>{operator[key]}</dd>
                                    </div>
                                ))}
                        </dl>
                    </section>

                    {copy.sections.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            className="mb-10 scroll-mt-8"
                        >
                            <h2 className="mb-3 text-[22px] font-semibold tracking-tight">
                                {section.title}
                            </h2>
                            {section.paragraphs?.map((text) => (
                                <p
                                    key={text}
                                    className="mb-3 text-[var(--l-body)]"
                                >
                                    {text}
                                </p>
                            ))}
                            {section.items && (
                                <ul className="list-disc space-y-2.5 pl-5 text-[var(--l-body)]">
                                    {section.items.map((text) => (
                                        <li key={text}>{text}</li>
                                    ))}
                                </ul>
                            )}
                            {section.id === 'cookies' && (
                                <>
                                    <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--l-border)]">
                                        <table className="w-full min-w-[560px] text-left text-sm">
                                            <thead className="bg-[var(--l-soft)] text-[var(--l-muted)]">
                                                <tr>
                                                    {copy.cookieTable.head.map(
                                                        (cell) => (
                                                            <th
                                                                key={cell}
                                                                className="px-3.5 py-2.5 font-medium"
                                                            >
                                                                {cell}
                                                            </th>
                                                        ),
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--l-border)] text-[var(--l-body)]">
                                                {copy.cookieTable.rows.map(
                                                    (row) => (
                                                        <tr key={row[0]}>
                                                            {row.map(
                                                                (
                                                                    cell,
                                                                    index,
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            index
                                                                        }
                                                                        className={
                                                                            index ===
                                                                            0
                                                                                ? 'px-3.5 py-2.5 font-mono text-[13px] text-[var(--l-ink)]'
                                                                                : 'px-3.5 py-2.5'
                                                                        }
                                                                    >
                                                                        {cell}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openCookieSettings}
                                        className="mt-4 rounded-full border border-[var(--l-border)] px-5 py-2.5 text-[14.5px] font-medium hover:border-[var(--l-muted)]"
                                    >
                                        {copy.cookieSettings}
                                    </button>
                                </>
                            )}
                        </section>
                    ))}
                </main>
            </div>
        </>
    );
}
