/**
 * Project JAIna — Tienda de Cosméticos Sin Pay-to-Win
 * Archivo: js/store.js
 * Versión: 4.0 Hito-126
 * ─────────────────────────────────────────────────────────────────────────────
 * Nuevas funciones Hito #126:
 *  1. loadRemoteCatalog()   → fetch /api/shop/catalog en vivo desde WebAPI.
 *  2. renderCatalogCards()  → cards enriquecidas con insignia de rareza WoW.
 *  3. selectPackage()       → valida personaje en vivo (/api/armory/search)
 *                             antes de renderizar PayPal SDK.
 *  4. simulateTestDonation()→ POST /api/shop/simulate_delivery con feedback.
 *  5. CharValidationBadge   → muestra GS, clase y guild del destinatario real.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Catálogo fallback (SSOT local) — sincronizado con store_catalog.json en WebAPI
const DEFAULT_CATALOG = [
    {
        "id": "pack_jaina_token_single",
        "category": "tokens",
        "rarity": "epico",
        "rarity_label": "FICHA WOW",
        "name": "Ficha de Jaina (WoW Token)",
        "description": "Ficha oficial comerciable in-game por oro. Al consumirse con clic derecho acredita +100 Puntos de Donación (PD) a tu cuenta web.",
        "price_pen": 7.0,
        "price_usd": 1.99,
        "price": "1.99",
        "currency": "USD",
        "tokens": 100,
        "icon": "🎫",
        "rewards": [
            {
                "type": "item",
                "entry": 900200,
                "count": 1,
                "name": "Ficha de Jaina"
            }
        ]
    },
    {
        "id": "pack_welcome",
        "category": "tokens",
        "rarity": "raro",
        "rarity_label": "BIENVENIDA",
        "name": "Pack de Bienvenida al Reino",
        "description": "4 Carteras de Tejido de Escarcha (20c) + Mascota Exclusiva 'Osezno de Blizzard' + 10 Fichas de Evento + 100 Tokens de Jaina.",
        "price_pen": 7.0,
        "price_usd": 1.99,
        "price": "1.99",
        "currency": "USD",
        "tokens": 100,
        "icon": "🎁",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 100,
                "name": "Token de Jaina"
            },
            {
                "type": "item",
                "entry": 41599,
                "count": 4,
                "name": "Cartera de Tejido de Escarcha (20c)"
            },
            {
                "type": "item",
                "entry": 44819,
                "count": 1,
                "name": "Osezno de Blizzard"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 10,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "pack_tier1",
        "category": "tokens",
        "rarity": "raro",
        "rarity_label": "RARO",
        "name": "Cofre de la Dama Valiente",
        "description": "500 Tokens de Jaina + 4 Bolsas de Viajero Arcano (20c) + 10 Fichas de Evento para la Tesorería.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 500,
        "icon": "🪙",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 500,
                "name": "Token de Jaina"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 10,
                "name": "Ficha de Evento"
            },
            {
                "type": "item",
                "entry": 21841,
                "count": 4,
                "name": "Bolsa de Viajero Arcano"
            }
        ]
    },
    {
        "id": "pack_tier2",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "ÉPICO",
        "name": "Arsenal Arcano de Theramore",
        "description": "1,500 Tokens de Jaina + Montura Épica Terrestre 'Tigre Espectral Raudo' (100% vel).",
        "price_pen": 35.0,
        "price_usd": 9.5,
        "price": "9.50",
        "currency": "USD",
        "tokens": 1500,
        "icon": "🐉",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 1500,
                "name": "Token de Jaina"
            },
            {
                "type": "mount",
                "entry": 49284,
                "count": 1,
                "name": "Reins of the Swift Spectral Tiger",
                "data": "42777"
            }
        ]
    },
    {
        "id": "pack_tier3",
        "category": "mounts",
        "rarity": "legendario",
        "rarity_label": "LEGENDARIO",
        "name": "Soberano de Dalaran",
        "description": "3,500 Tokens de Jaina + Riendas del Destrero Celestial Titánico + Título Honorífico 'Soberano de Theramore'.",
        "price_pen": 65.0,
        "price_usd": 17.5,
        "price": "17.50",
        "currency": "USD",
        "tokens": 3500,
        "icon": "👑",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 3500,
                "name": "Token de Jaina"
            },
            {
                "type": "mount",
                "entry": 54811,
                "count": 1,
                "name": "Celestial Steed",
                "data": "74856"
            },
            {
                "type": "title",
                "entry": 145,
                "count": 1,
                "name": "Soberano de Theramore"
            }
        ]
    },
    {
        "id": "pack_tier4",
        "category": "mounts",
        "rarity": "mitico",
        "rarity_label": "MÍTICO",
        "name": "Bendición del Consejo de los Seis",
        "description": "8,000 Tokens de Jaina + Montura Mítica 'Invencible de Arthas' (Riendas de Invencible con huellas de escarcha).",
        "price_pen": 120.0,
        "price_usd": 32.0,
        "price": "32.00",
        "currency": "USD",
        "tokens": 8000,
        "icon": "🔮",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 8000,
                "name": "Token de Jaina"
            },
            {
                "type": "mount",
                "entry": 50818,
                "count": 1,
                "name": "Invincible's Reins",
                "data": "72286"
            }
        ]
    },
    {
        "id": "pack_club_kirintor",
        "category": "services",
        "rarity": "legendario",
        "rarity_label": "MEMBRESÍA VIP",
        "name": "Membresía Mensual: Club Kirin Tor",
        "description": "Acceso VIP completo al Pase de Batalla + 300 Tokens de Jaina mensuales + 20 Fichas de Evento + Rango Honorífico Kirin Tor.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 300,
        "icon": "🏰",
        "rewards": [
            {
                "type": "vip",
                "entry": 1,
                "count": 1,
                "name": "Acceso VIP Pase de Batalla"
            },
            {
                "type": "item",
                "entry": 900100,
                "count": 300,
                "name": "Token de Jaina"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 20,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "pack_supporter",
        "category": "battlepass",
        "rarity": "epico",
        "rarity_label": "PASE VIP",
        "name": "Pase de Batalla VIP Project JAIna",
        "description": "Desbloquea los 100 niveles prémium del Pase de Batalla de la temporada actual con cosméticos exclusivos.",
        "price_pen": 25.0,
        "price_usd": 7.0,
        "price": "7.00",
        "currency": "USD",
        "tokens": 0,
        "icon": "🏆",
        "rewards": [
            {
                "type": "vip",
                "entry": 1,
                "count": 1,
                "name": "Acceso VIP Pase de Batalla"
            }
        ]
    },
    {
        "id": "pack_bp_skip5",
        "category": "battlepass",
        "rarity": "epico",
        "rarity_label": "SALTO TIERS",
        "name": "Acelerador de Pase (+5 Niveles)",
        "description": "Acredita +5 niveles instantáneos a tu Pase de Batalla activo (hasta Nivel 50) para reclamar recompensas de temporada.",
        "price_pen": 10.0,
        "price_usd": 2.8,
        "price": "2.80",
        "currency": "USD",
        "tokens": 0,
        "icon": "⚡",
        "rewards": [
            {
                "type": "bp_levels",
                "entry": 5,
                "count": 5,
                "name": "+5 Niveles de Pase de Batalla"
            }
        ]
    },
    {
        "id": "pack_dual_spec",
        "category": "services",
        "rarity": "raro",
        "rarity_label": "COMODIDAD",
        "name": "Desbloqueo de Doble Especialización",
        "description": "1,000 monedas de oro (1,000g) en mano/correo para activar de inmediato la Doble Especialización con tu instructor de clase + 100 Tokens.",
        "price_pen": 10.0,
        "price_usd": 2.8,
        "price": "2.80",
        "currency": "USD",
        "tokens": 100,
        "icon": "⚖️",
        "rewards": [
            {
                "type": "money",
                "entry": 10000000,
                "count": 1,
                "name": "1,000 Monedas de Oro (1,000g)"
            },
            {
                "type": "item",
                "entry": 900100,
                "count": 100,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "service_rename",
        "category": "services",
        "rarity": "especial",
        "rarity_label": "SERVICIO",
        "name": "Servicio: Cambio de Nombre, Raza o Facción",
        "description": "400 Tokens de Jaina para canjear servicios cosméticos y de identidad de personaje con Kaelia Sombraetérea.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 400,
        "icon": "📜",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 400,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "wings_celestial",
        "category": "wings",
        "rarity": "epico",
        "rarity_label": "AURA MÍSTICA",
        "name": "Alas Angelicales Celestiales (Blancas / Rojas)",
        "description": "Desbloqueo inmediato in-game de las Alas Angelicales Blancas animadas + 15 Fichas de Evento.",
        "price_pen": 20.0,
        "price_usd": 5.5,
        "price": "5.50",
        "currency": "USD",
        "tokens": 600,
        "icon": "🪽",
        "rewards": [
            {
                "type": "aura",
                "entry": 1,
                "count": 1,
                "name": "Alas Angelicales Blancas",
                "data": "exp"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 15,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "wings_demonic",
        "category": "wings",
        "rarity": "epico",
        "rarity_label": "AURA MÍSTICA",
        "name": "Alas Demoníacas del Abismo (4 Variantes)",
        "description": "Desbloqueo in-game de las Alas Demoníacas Rojas con partículas de fuego vil + 15 Fichas de Evento.",
        "price_pen": 20.0,
        "price_usd": 5.5,
        "price": "5.50",
        "currency": "USD",
        "tokens": 700,
        "icon": "🦇",
        "rewards": [
            {
                "type": "aura",
                "entry": 4,
                "count": 1,
                "name": "Alas Demoníacas Rojas",
                "data": "oro"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 15,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "wings_elements",
        "category": "wings",
        "rarity": "legendario",
        "rarity_label": "ELEMENTAL",
        "name": "Alas de Hielo de Rasganorte & Fuego de Ragnaros",
        "description": "Desbloqueo de las legendarias Alas de Hielo de Sindragosa con estela de escarcha + 20 Fichas de Evento.",
        "price_pen": 25.0,
        "price_usd": 7.0,
        "price": "7.00",
        "currency": "USD",
        "tokens": 800,
        "icon": "❄️",
        "rewards": [
            {
                "type": "aura",
                "entry": 13,
                "count": 1,
                "name": "Alas de Hielo",
                "data": "rep"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 20,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "wings_collection_17",
        "category": "wings",
        "rarity": "mitico",
        "rarity_label": "COLECCIÓN SUPREMA",
        "name": "Colección Completa de las 17 Alas Místicas de Dalaran",
        "description": "50 Fichas de Evento + Desbloqueo permanente de las 17 variantes de alas en tu cuenta de juego.",
        "price_pen": 50.0,
        "price_usd": 13.5,
        "price": "13.50",
        "currency": "USD",
        "tokens": 1800,
        "icon": "✨",
        "rewards": [
            {
                "type": "aura",
                "entry": 1,
                "count": 1,
                "name": "Alas Angelicales Blancas"
            },
            {
                "type": "aura",
                "entry": 4,
                "count": 1,
                "name": "Alas Demoníacas Rojas"
            },
            {
                "type": "aura",
                "entry": 13,
                "count": 1,
                "name": "Alas de Hielo"
            },
            {
                "type": "item",
                "entry": 910000,
                "count": 50,
                "name": "Ficha de Evento"
            }
        ]
    },
    {
        "id": "transmog_pass_single",
        "category": "transmog",
        "rarity": "raro",
        "rarity_label": "ILUSIÓN",
        "name": "Pase de Ilusión Transparente (Individual)",
        "description": "350 Tokens de Jaina para transfigurar ranuras invisibles de equipamiento con Kaelia Sombraetérea.",
        "price_pen": 10.0,
        "price_usd": 2.8,
        "price": "2.80",
        "currency": "USD",
        "tokens": 350,
        "icon": "👗",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 350,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "transmog_fullset_turtle",
        "category": "transmog",
        "rarity": "legendario",
        "rarity_label": "EXCLUSIVO JAINACORE",
        "name": "Guardarropa Invisible Completo (Set Total de 9 Ranuras)",
        "description": "850 Tokens de Jaina para transfigurar el vestidor completo de 9 piezas transparentes sin perder gemas ni stats.",
        "price_pen": 25.0,
        "price_usd": 6.8,
        "price": "6.80",
        "currency": "USD",
        "tokens": 850,
        "icon": "✨",
        "rewards": [
            {
                "type": "item",
                "entry": 900100,
                "count": 850,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "apparel_archmage",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "INDUMENTARIA TELA",
        "name": "Indumentaria: Hábito Arcano del Archimago",
        "description": "Ropajes de alta costura para taumaturgos. Incluye Toga del Archimago, Diadema Mística y 350 Tokens de Jaina para transfigurar.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 500,
        "icon": "🧙",
        "rewards": [
            {
                "type": "item",
                "entry": 13346,
                "count": 1,
                "name": "Toga del Archimago"
            },
            {
                "type": "item",
                "entry": 10250,
                "count": 1,
                "name": "Diadema de Mago Épica"
            },
            {
                "type": "item",
                "entry": 900100,
                "count": 350,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "apparel_vanguard",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "INDUMENTARIA PLACAS",
        "name": "Indumentaria: Armadura de Campeón de la Vanguardia",
        "description": "Set de placas pulidas de la Gran Alianza / Horda de Hierro. Incluye Coraza Bruñida, Hombreras de Guerra y 350 Tokens de Jaina.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 500,
        "icon": "🛡️",
        "rewards": [
            {
                "type": "item",
                "entry": 14551,
                "count": 1,
                "name": "Coraza de la Vanguardia Bruñida"
            },
            {
                "type": "item",
                "entry": 14552,
                "count": 1,
                "name": "Hombreras de Campeón"
            },
            {
                "type": "item",
                "entry": 900100,
                "count": 350,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "apparel_shadow",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "INDUMENTARIA CUERO",
        "name": "Indumentaria: Ropajes del Asesino de las Sombras",
        "description": "Atuendo de cuero negro y máscara sombría para pícaros, cazadores y druidas. Incluye Túnica Sombría, Máscara y 350 Tokens de Jaina.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 500,
        "icon": "🗡️",
        "rewards": [
            {
                "type": "item",
                "entry": 15086,
                "count": 1,
                "name": "Túnica de Asesino Sombrío"
            },
            {
                "type": "item",
                "entry": 10252,
                "count": 1,
                "name": "Máscara de las Sombras"
            },
            {
                "type": "item",
                "entry": 900100,
                "count": 350,
                "name": "Token de Jaina"
            }
        ]
    },
    {
        "id": "apparel_gala_tuxedo",
        "category": "transmog",
        "rarity": "raro",
        "rarity_label": "ROPA SOCIAL & FIESTA",
        "name": "Atuendo de Gala Noble & Esmoquin de Dalaran",
        "description": "Conjunto formal de vestir para eventos sociales, banquetes y bodas. Incluye Chaqueta, Pantalones y Camisa de Esmoquin + Vestido Elegante.",
        "price_pen": 12.0,
        "price_usd": 3.2,
        "price": "3.20",
        "currency": "USD",
        "tokens": 350,
        "icon": "👔",
        "rewards": [
            {
                "type": "item",
                "entry": 10036,
                "count": 1,
                "name": "Chaqueta de esmoquin"
            },
            {
                "type": "item",
                "entry": 10035,
                "count": 1,
                "name": "Pantalones de esmoquin"
            },
            {
                "type": "item",
                "entry": 10034,
                "count": 1,
                "name": "Camisa de esmoquin blanca"
            },
            {
                "type": "item",
                "entry": 6833,
                "count": 1,
                "name": "Vestido negro elegante"
            }
        ]
    },
    {
        "id": "set_tier0_valor",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Armadura del Valeroso (8/8)",
        "description": "Set Pre-Raid de Placas nivel 58-60 completo para Guerreros: Coraza, Yelmo, Musleras, Hombreras, Botas, Brazales, Faja y Guanteletes del Valeroso.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🛡️",
        "rewards": [
            {
                "type": "item",
                "entry": 16730,
                "count": 1,
                "name": "Coraza del Valeroso"
            },
            {
                "type": "item",
                "entry": 16731,
                "count": 1,
                "name": "Yelmo del Valeroso"
            },
            {
                "type": "item",
                "entry": 16732,
                "count": 1,
                "name": "Musleras del Valeroso"
            },
            {
                "type": "item",
                "entry": 16733,
                "count": 1,
                "name": "Hombreras del Valeroso"
            },
            {
                "type": "item",
                "entry": 16734,
                "count": 1,
                "name": "Botas del Valeroso"
            },
            {
                "type": "item",
                "entry": 16735,
                "count": 1,
                "name": "Brazales del Valeroso"
            },
            {
                "type": "item",
                "entry": 16736,
                "count": 1,
                "name": "Faja del Valeroso"
            },
            {
                "type": "item",
                "entry": 16737,
                "count": 1,
                "name": "Guanteletes del Valeroso"
            }
        ]
    },
    {
        "id": "set_tier0_lightforge",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Forja de la Luz (8/8)",
        "description": "Set Pre-Raid de Placas nivel 58-60 completo para Paladines: Coraza, Yelmo, Musleras, Hombreras, Botas, Brazales, Faja y Guanteletes de la Forja de la Luz.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "✨",
        "rewards": [
            {
                "type": "item",
                "entry": 16726,
                "count": 1,
                "name": "Pechera Furia de la Luz"
            },
            {
                "type": "item",
                "entry": 16721,
                "count": 1,
                "name": "Yelmo Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16728,
                "count": 1,
                "name": "Placas de pierna Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16729,
                "count": 1,
                "name": "Hombreras Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16727,
                "count": 1,
                "name": "Botas Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16725,
                "count": 1,
                "name": "Brazales Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16723,
                "count": 1,
                "name": "Cinto Forja de la Luz"
            },
            {
                "type": "item",
                "entry": 16724,
                "count": 1,
                "name": "Guanteletes Forja de la Luz"
            }
        ]
    },
    {
        "id": "set_tier0_shadowcraft",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Acechador Sombrío (8/8)",
        "description": "Set Pre-Raid de Cuero nivel 58-60 completo para Pícaros: Casquete, Espaldares, Pantalones, Brazales, Botas, Cinto, Guantes y Túnica del Acechador Sombrío.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🗡️",
        "rewards": [
            {
                "type": "item",
                "entry": 16707,
                "count": 1,
                "name": "Casquete del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16708,
                "count": 1,
                "name": "Espaldares del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16709,
                "count": 1,
                "name": "Pantalones del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16710,
                "count": 1,
                "name": "Brazales del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16711,
                "count": 1,
                "name": "Botas del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16712,
                "count": 1,
                "name": "Cinto del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16713,
                "count": 1,
                "name": "Guantes del Acechador Sombrío"
            },
            {
                "type": "item",
                "entry": 16720,
                "count": 1,
                "name": "Túnica del Acechador Sombrío"
            }
        ]
    },
    {
        "id": "set_tier0_wildheart",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Piel de Fiera (8/8)",
        "description": "Set Pre-Raid de Cuero nivel 58-60 completo para Druidas: Chaleco, Brazales, Botas, Cinto, Guantes, Caperuza, Espaldares y Falda Piel de Fiera.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🐾",
        "rewards": [
            {
                "type": "item",
                "entry": 16706,
                "count": 1,
                "name": "Chaleco Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16714,
                "count": 1,
                "name": "Brazales Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16715,
                "count": 1,
                "name": "Botas Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16716,
                "count": 1,
                "name": "Cinto Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16717,
                "count": 1,
                "name": "Guantes Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16718,
                "count": 1,
                "name": "Caperuza Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16719,
                "count": 1,
                "name": "Espaldares Piel de Fiera"
            },
            {
                "type": "item",
                "entry": 16720,
                "count": 1,
                "name": "Falda Piel de Fiera"
            }
        ]
    },
    {
        "id": "set_tier0_beaststalker",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Acechador de Fieras (8/8)",
        "description": "Set Pre-Raid de Malla nivel 58-60 completo para Cazadores: Túnica, Botas, Guantes, Gorro, Pantalones, Espaldares, Cinto y Brazales de Acechador de Fieras.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🏹",
        "rewards": [
            {
                "type": "item",
                "entry": 16674,
                "count": 1,
                "name": "Túnica de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16675,
                "count": 1,
                "name": "Botas de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16676,
                "count": 1,
                "name": "Guantes de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16677,
                "count": 1,
                "name": "Gorro de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16678,
                "count": 1,
                "name": "Pantalones de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16679,
                "count": 1,
                "name": "Espaldares de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16680,
                "count": 1,
                "name": "Cinto de Acechador de Fieras"
            },
            {
                "type": "item",
                "entry": 16681,
                "count": 1,
                "name": "Brazales de Acechador de Fieras"
            }
        ]
    },
    {
        "id": "set_tier0_elements",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Los Elementos (8/8)",
        "description": "Set Pre-Raid de Malla nivel 58-60 completo para Chamanes: Chaleco, Almófar, Guardarrenos, Bufas, Botas, Brazales, Cordón y Guanteletes de los Elementos.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "⚡",
        "rewards": [
            {
                "type": "item",
                "entry": 16666,
                "count": 1,
                "name": "Chaleco de los Elementos"
            },
            {
                "type": "item",
                "entry": 16667,
                "count": 1,
                "name": "Almófar de los Elementos"
            },
            {
                "type": "item",
                "entry": 16668,
                "count": 1,
                "name": "Guardarrenos de los Elementos"
            },
            {
                "type": "item",
                "entry": 16669,
                "count": 1,
                "name": "Bufas de los Elementos"
            },
            {
                "type": "item",
                "entry": 16670,
                "count": 1,
                "name": "Botas de los Elementos"
            },
            {
                "type": "item",
                "entry": 16671,
                "count": 1,
                "name": "Brazales de los Elementos"
            },
            {
                "type": "item",
                "entry": 16672,
                "count": 1,
                "name": "Cordón de los Elementos"
            },
            {
                "type": "item",
                "entry": 16673,
                "count": 1,
                "name": "Guanteletes de los Elementos"
            }
        ]
    },
    {
        "id": "set_tier0_magister",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Ropajes del Magister (8/8)",
        "description": "Set Pre-Raid de Tela nivel 58-60 completo para Magos: Ropas, Corona, Calzas, Manto, Botas, Cinto, Guantes y Ataduras del Magister.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🔮",
        "rewards": [
            {
                "type": "item",
                "entry": 16688,
                "count": 1,
                "name": "Ropas del Magister"
            },
            {
                "type": "item",
                "entry": 16686,
                "count": 1,
                "name": "Corona del Magister"
            },
            {
                "type": "item",
                "entry": 16687,
                "count": 1,
                "name": "Calzas del Magister"
            },
            {
                "type": "item",
                "entry": 16689,
                "count": 1,
                "name": "Manto del Magister"
            },
            {
                "type": "item",
                "entry": 16682,
                "count": 1,
                "name": "Botas del Magister"
            },
            {
                "type": "item",
                "entry": 16685,
                "count": 1,
                "name": "Cinto del Magister"
            },
            {
                "type": "item",
                "entry": 16684,
                "count": 1,
                "name": "Guantes del Magister"
            },
            {
                "type": "item",
                "entry": 16683,
                "count": 1,
                "name": "Ataduras del Magister"
            }
        ]
    },
    {
        "id": "set_tier0_devout",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Vestiduras de Devoción (8/8)",
        "description": "Set Pre-Raid de Tela nivel 58-60 completo para Sacerdotes: Toga, Corona, Falda, Manto, Sandalias, Guantes, Cinto y Brazales de Devoción.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "🕊️",
        "rewards": [
            {
                "type": "item",
                "entry": 16690,
                "count": 1,
                "name": "Toga de Devoción"
            },
            {
                "type": "item",
                "entry": 16693,
                "count": 1,
                "name": "Corona de Devoción"
            },
            {
                "type": "item",
                "entry": 16694,
                "count": 1,
                "name": "Falda de Devoción"
            },
            {
                "type": "item",
                "entry": 16695,
                "count": 1,
                "name": "Manto de Devoción"
            },
            {
                "type": "item",
                "entry": 16691,
                "count": 1,
                "name": "Sandalias de Devoción"
            },
            {
                "type": "item",
                "entry": 16692,
                "count": 1,
                "name": "Guantes de Devoción"
            },
            {
                "type": "item",
                "entry": 16696,
                "count": 1,
                "name": "Cinto de Devoción"
            },
            {
                "type": "item",
                "entry": 16697,
                "count": 1,
                "name": "Brazales de Devoción"
            }
        ]
    },
    {
        "id": "set_tier0_dreadmist",
        "category": "transmog",
        "rarity": "epico",
        "rarity_label": "SET CLÁSICO T0",
        "name": "Set de Mazmorra: Tejedor de la Muerte (8/8)",
        "description": "Set Pre-Raid de Tela nivel 58-60 completo para Brujos: Toga, Máscara, Calzas, Manto, Sandalias, Envolturas, Faja y Brazales Niebla Nefasta.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "💀",
        "rewards": [
            {
                "type": "item",
                "entry": 16700,
                "count": 1,
                "name": "Toga Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16698,
                "count": 1,
                "name": "Máscara Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16699,
                "count": 1,
                "name": "Calzas Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16701,
                "count": 1,
                "name": "Manto Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16702,
                "count": 1,
                "name": "Sandalias Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16703,
                "count": 1,
                "name": "Envolturas Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16704,
                "count": 1,
                "name": "Faja Niebla Nefasta"
            },
            {
                "type": "item",
                "entry": 16705,
                "count": 1,
                "name": "Brazales Niebla Nefasta"
            }
        ]
    },
    {
        "id": "crafted_imperial_plate",
        "category": "crafted",
        "rarity": "raro",
        "rarity_label": "HERRERÍA CLÁSICA",
        "name": "Armadura Imperial de Placas (7 Piezas)",
        "description": "Set artesanal completo de Herrería nivel 50-55: Peto, Yelmo, Espaldares, Quijotes, Botas, Brazales y Faja Imperial de Placas.",
        "price_pen": 14.0,
        "price_usd": 3.99,
        "price": "3.99",
        "currency": "USD",
        "tokens": 200,
        "icon": "🔨",
        "rewards": [
            {
                "type": "item",
                "entry": 12422,
                "count": 1,
                "name": "Peto Imperial de Placas"
            },
            {
                "type": "item",
                "entry": 12427,
                "count": 1,
                "name": "Yelmo Imperial de Placas"
            },
            {
                "type": "item",
                "entry": 12428,
                "count": 1,
                "name": "Hombreras Imperiales de Placas"
            },
            {
                "type": "item",
                "entry": 12429,
                "count": 1,
                "name": "Quijotes Imperiales de Placas"
            },
            {
                "type": "item",
                "entry": 12426,
                "count": 1,
                "name": "Botas Imperiales de Placas"
            },
            {
                "type": "item",
                "entry": 12425,
                "count": 1,
                "name": "Brazales Imperiales de Placas"
            },
            {
                "type": "item",
                "entry": 12424,
                "count": 1,
                "name": "Cinturón Imperial de Placas"
            }
        ]
    },
    {
        "id": "crafted_devilsaur_leather",
        "category": "crafted",
        "rarity": "epico",
        "rarity_label": "PELETERÍA CLÁSICA",
        "name": "Dúo Diabosáurico de Cráter de Un'Goro",
        "description": "El codiciado conjunto de Peletería nivel 53-55: Leotardos de Diabosaurio (+46 PA, +1% Crítico) y Guanteletes de Diabosaurio (+28 PA, +1% Crítico, +2% Golpe de set).",
        "price_pen": 14.0,
        "price_usd": 3.99,
        "price": "3.99",
        "currency": "USD",
        "tokens": 200,
        "icon": "🦖",
        "rewards": [
            {
                "type": "item",
                "entry": 15062,
                "count": 1,
                "name": "Leotardos de Diabosaurio"
            },
            {
                "type": "item",
                "entry": 15063,
                "count": 1,
                "name": "Guanteletes de Diabosaurio"
            }
        ]
    },
    {
        "id": "crafted_shadoweave_set",
        "category": "crafted",
        "rarity": "raro",
        "rarity_label": "SASTRERÍA CLÁSICA",
        "name": "Vestiduras de Tejido de Sombras (6 Piezas)",
        "description": "Set artesanal de Sastrería nivel 45-52 potenciador de Sombras: Toga, Pantalones, Guantes, Hombreras, Botas y Máscara de Tejido de Sombras.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 180,
        "icon": "🕸️",
        "rewards": [
            {
                "type": "item",
                "entry": 10000,
                "count": 1,
                "name": "Toga de Tejido de Sombras"
            },
            {
                "type": "item",
                "entry": 9998,
                "count": 1,
                "name": "Pantalones de Tejido de Sombras"
            },
            {
                "type": "item",
                "entry": 10001,
                "count": 1,
                "name": "Guantes de Tejido de Sombras"
            },
            {
                "type": "item",
                "entry": 10003,
                "count": 1,
                "name": "Hombreras de Tejido de Sombras"
            },
            {
                "type": "item",
                "entry": 10007,
                "count": 1,
                "name": "Botas de Tejido de Sombras"
            },
            {
                "type": "item",
                "entry": 10025,
                "count": 1,
                "name": "Máscara de Tejido de Sombras"
            }
        ]
    },
    {
        "id": "mat_mining_blacksmithing",
        "category": "materials",
        "rarity": "raro",
        "rarity_label": "SUMINISTROS",
        "name": "Alijo de la Gran Forja: Minería & Herrería",
        "description": "Lote completo de lingotes y gemas clásicas: 80x Barras de Torio, 80x Barras de Mitril, 80x Barras de Hierro, 80x Barras de Cobre y 10x Diamantes de Azeroth.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 180,
        "icon": "⛏️",
        "rewards": [
            {
                "type": "item",
                "entry": 12359,
                "count": 80,
                "name": "Barra de Torio"
            },
            {
                "type": "item",
                "entry": 3860,
                "count": 80,
                "name": "Barra de Mitril"
            },
            {
                "type": "item",
                "entry": 3575,
                "count": 80,
                "name": "Barra de Hierro"
            },
            {
                "type": "item",
                "entry": 2840,
                "count": 80,
                "name": "Barra de Cobre"
            },
            {
                "type": "item",
                "entry": 12800,
                "count": 10,
                "name": "Diamante de Azeroth"
            }
        ]
    },
    {
        "id": "mat_tailoring_cloth",
        "category": "materials",
        "rarity": "raro",
        "rarity_label": "SUMINISTROS",
        "name": "Fardo de Telas Clásicas: Sastrería",
        "description": "Fardo masivo de telas para subir sastrería de 1 a 300: 100x Paños de Runa, 100x Paños de Magia, 100x Paños de Seda y 80x Paños de Lana.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 180,
        "icon": "🧵",
        "rewards": [
            {
                "type": "item",
                "entry": 14047,
                "count": 100,
                "name": "Paño de Runa"
            },
            {
                "type": "item",
                "entry": 4338,
                "count": 100,
                "name": "Paño de Magia"
            },
            {
                "type": "item",
                "entry": 4306,
                "count": 100,
                "name": "Paño de Seda"
            },
            {
                "type": "item",
                "entry": 2592,
                "count": 80,
                "name": "Paño de Lana"
            }
        ]
    },
    {
        "id": "mat_leatherworking_skins",
        "category": "materials",
        "rarity": "raro",
        "rarity_label": "SUMINISTROS",
        "name": "Cargamento del Cazador: Cueros & Pieles",
        "description": "Lote completo de pieles para peletería y desuello 1-300: 80x Cueros Gruesos, 80x Cueros Bastos, 80x Cueros Pesados, 80x Cueros Medianos y 10x Cueros de Diabosaurio.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 180,
        "icon": "🦁",
        "rewards": [
            {
                "type": "item",
                "entry": 8170,
                "count": 80,
                "name": "Cuero Grueso"
            },
            {
                "type": "item",
                "entry": 4304,
                "count": 80,
                "name": "Cuero Basto"
            },
            {
                "type": "item",
                "entry": 4234,
                "count": 80,
                "name": "Cuero Pesado"
            },
            {
                "type": "item",
                "entry": 2319,
                "count": 80,
                "name": "Cuero Mediano"
            },
            {
                "type": "item",
                "entry": 15417,
                "count": 10,
                "name": "Cuero de Diabosaurio"
            }
        ]
    },
    {
        "id": "mat_alchemy_herbs",
        "category": "materials",
        "rarity": "raro",
        "rarity_label": "SUMINISTROS",
        "name": "Botica de Cenarion: Hierbas & Frascos",
        "description": "Hierbas selectas de Tierras de la Peste y frascos: 40x Flor de Peste, 40x Hojapeste, 40x Sansam Dorado, 5x Loto Negro y 100x Viales de Cristal.",
        "price_pen": 12.0,
        "price_usd": 3.5,
        "price": "3.50",
        "currency": "USD",
        "tokens": 180,
        "icon": "🌿",
        "rewards": [
            {
                "type": "item",
                "entry": 13466,
                "count": 40,
                "name": "Flor de Peste"
            },
            {
                "type": "item",
                "entry": 13463,
                "count": 40,
                "name": "Hojapeste"
            },
            {
                "type": "item",
                "entry": 13465,
                "count": 40,
                "name": "Sansam Dorado"
            },
            {
                "type": "item",
                "entry": 13468,
                "count": 5,
                "name": "Loto Negro"
            },
            {
                "type": "item",
                "entry": 8925,
                "count": 100,
                "name": "Vial de Cristal"
            }
        ]
    },
    {
        "id": "mat_enchanting_essences",
        "category": "materials",
        "rarity": "epico",
        "rarity_label": "SUMINISTROS",
        "name": "Arco de Desencantamiento: Polvos & Esencias",
        "description": "Lote supremo de encantamiento clásico: 40x Esencias Eternas Mayores, 100x Polvos de Ilusión, 20x Fragmentos Brillantes Grandes y 5x Cristales Nexo.",
        "price_pen": 14.0,
        "price_usd": 3.99,
        "price": "3.99",
        "currency": "USD",
        "tokens": 200,
        "icon": "✨",
        "rewards": [
            {
                "type": "item",
                "entry": 16204,
                "count": 40,
                "name": "Esencia Eterna Mayor"
            },
            {
                "type": "item",
                "entry": 16203,
                "count": 100,
                "name": "Polvo de Ilusión"
            },
            {
                "type": "item",
                "entry": 14344,
                "count": 20,
                "name": "Fragmento Brillante Grande"
            },
            {
                "type": "item",
                "entry": 20725,
                "count": 5,
                "name": "Cristal Nexo"
            }
        ]
    },
    {
        "id": "mount_great_white_kodo",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA HORDA",
        "name": "Gran Kodo Blanco de Mulgore",
        "description": "Montura terrestre épica de los Tauren de Cima del Trueno (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🦏",
        "rewards": [
            {
                "type": "item",
                "entry": 18796,
                "count": 1,
                "name": "Gran Kodo Blanco"
            }
        ]
    },
    {
        "id": "mount_swift_brown_wolf",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA HORDA",
        "name": "Cuerno del Lobo Pardo Raudo",
        "description": "Montura terrestre épica de los Orcos de Orgrimmar (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🐺",
        "rewards": [
            {
                "type": "item",
                "entry": 18794,
                "count": 1,
                "name": "Cuerno del Lobo Pardo Raudo"
            }
        ]
    },
    {
        "id": "mount_red_skeletal_warhorse",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA HORDA",
        "name": "Caballo de Guerra Esquelético Rojo",
        "description": "Montura terrestre épica de los Renegados de Entrañas (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🐴",
        "rewards": [
            {
                "type": "item",
                "entry": 18792,
                "count": 1,
                "name": "Caballo de Guerra Esquelético Rojo"
            }
        ]
    },
    {
        "id": "mount_swift_blue_raptor",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA HORDA",
        "name": "Silbato del Raptor Azul Raudo",
        "description": "Montura terrestre épica de los Trols Lanza Negra (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🦖",
        "rewards": [
            {
                "type": "item",
                "entry": 18788,
                "count": 1,
                "name": "Silbato del Raptor Azul Raudo"
            }
        ]
    },
    {
        "id": "mount_swift_frostsaber",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA ALIANZA",
        "name": "Riendas del Sable de Hielo Raudo",
        "description": "Montura terrestre épica de los Elfos de la Noche de Darnassus (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🐯",
        "rewards": [
            {
                "type": "item",
                "entry": 18768,
                "count": 1,
                "name": "Riendas del Sable de Hielo Raudo"
            }
        ]
    },
    {
        "id": "mount_swift_white_ram",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA ALIANZA",
        "name": "Carnero Blanco Raudo de Forjaz",
        "description": "Montura terrestre épica de los Enanos de Forjaz (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🐏",
        "rewards": [
            {
                "type": "item",
                "entry": 18786,
                "count": 1,
                "name": "Carnero Blanco Raudo"
            }
        ]
    },
    {
        "id": "mount_swift_white_mechanostrider",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA ALIANZA",
        "name": "Mecazancudo Blanco Raudo",
        "description": "Montura terrestre épica de los Gnomos de Gnomeregan (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🤖",
        "rewards": [
            {
                "type": "item",
                "entry": 18776,
                "count": 1,
                "name": "Mecazancudo Blanco Raudo"
            }
        ]
    },
    {
        "id": "mount_swift_white_steed",
        "category": "mounts",
        "rarity": "epico",
        "rarity_label": "MONTURA ALIANZA",
        "name": "Corcel Blanco Raudo de Ventormenta",
        "description": "Montura terrestre épica de los Humanos de Ventormenta (+100% de velocidad). Requiere nivel 40.",
        "price_pen": 15.0,
        "price_usd": 4.0,
        "price": "4.00",
        "currency": "USD",
        "tokens": 200,
        "icon": "🐎",
        "rewards": [
            {
                "type": "item",
                "entry": 18773,
                "count": 1,
                "name": "Corcel Blanco Raudo"
            }
        ]
    },
    {
        "id": "service_profession_boost_300",
        "category": "services",
        "rarity": "epico",
        "rarity_label": "SERVICIO DE CUENTA",
        "name": "Maestría de Profesión (1 a 300)",
        "description": "Sube cualquier profesión primaria seleccionada directamente al tope máximo de la Era Vanilla (300/300) con recetas esenciales aprendidas.",
        "price_pen": 18.0,
        "price_usd": 5.0,
        "price": "5.00",
        "currency": "USD",
        "tokens": 250,
        "icon": "📜",
        "rewards": [
            {
                "type": "service",
                "entry": 300,
                "count": 1,
                "name": "Boost de Profesión a 300"
            }
        ]
    }
];

// Colores de rareza canónicos de WoW
const RARITY_COLORS = {
    raro:       { border:"#0070dd", glow:"rgba(0,112,221,.25)",  text:"#0070dd" },
    epico:      { border:"#a335ee", glow:"rgba(163,53,238,.25)", text:"#a335ee" },
    legendario: { border:"#ff8000", glow:"rgba(255,128,0,.28)",  text:"#ff8000" },
    mitico:     { border:"#ffd700", glow:"rgba(255,215,0,.30)",  text:"#ffd700" },
    especial:   { border:"#1eff00", glow:"rgba(30,255,0,.20)",   text:"#1eff00" }
};

let selectedPackage   = null;
let currentCatalog    = [...DEFAULT_CATALOG];
let currentCategory   = "all";
let currentCurrency   = "USD";    // Moneda por defecto: Dólares Internacionales (USD $)
let currentPaymentMethod = "paypal"; // Medio por defecto: PayPal / Tarjeta Internacional
let _validatedChar    = null;     // Resultado de validación en vivo del personaje

document.addEventListener("DOMContentLoaded", () => { initShop(); });

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
function initShop() {
    renderCatalogCards(currentCatalog);
    setupCategoryFilters();
    setupCheckoutListeners();
    loadRemoteCatalog();
    loadServerFundingGoal();
    loadPaymentConfig();
    setCurrency("USD");
    setPaymentMethod("paypal");
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR DE DIVISAS (PEN S/. vs USD $)
// ─────────────────────────────────────────────────────────────────────────────
function setCurrency(curr) {
    currentCurrency = curr === "USD" ? "USD" : "PEN";
    
    const btnPEN = document.getElementById("currBtnPEN");
    const btnUSD = document.getElementById("currBtnUSD");
    
    if (btnPEN && btnUSD) {
        if (currentCurrency === "PEN") {
            btnPEN.style.background = "#0284c7";
            btnPEN.style.color = "#ffffff";
            btnUSD.style.background = "transparent";
            btnUSD.style.color = "#94a3b8";
        } else {
            btnUSD.style.background = "#0284c7";
            btnUSD.style.color = "#ffffff";
            btnPEN.style.background = "transparent";
            btnPEN.style.color = "#94a3b8";
        }
    }
    
    renderCatalogCards(currentCatalog);
    
    if (selectedPackage) {
        updateCheckoutSummary();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR DE MÉTODO DE PAGO (PayPal Oficial vs GitHub Sponsors)
// ─────────────────────────────────────────────────────────────────────────────
function setPaymentMethod(method) {
    currentPaymentMethod = method === "github" ? "github" : "paypal";
    const paypalCard = document.getElementById("methodCardPaypal");
    const githubCard = document.getElementById("methodCardGithub");
    const paypalDetails = document.getElementById("paypalDetailsContainer");
    const githubDetails = document.getElementById("githubDetailsContainer");
    
    if (currentPaymentMethod === "github") {
        if (githubCard) {
            githubCard.style.background = "rgba(244, 63, 94, 0.25)";
            githubCard.style.border = "2px solid #f43f5e";
        }
        if (paypalCard) {
            paypalCard.style.background = "rgba(2, 132, 199, 0.08)";
            paypalCard.style.border = "1px solid rgba(56, 189, 248, 0.25)";
        }
        if (githubDetails) githubDetails.style.display = "block";
        if (paypalDetails) paypalDetails.style.display = "none";
    } else {
        if (paypalCard) {
            paypalCard.style.background = "rgba(2, 132, 199, 0.25)";
            paypalCard.style.border = "2px solid #38bdf8";
        }
        if (githubCard) {
            githubCard.style.background = "rgba(255, 255, 255, 0.05)";
            githubCard.style.border = "1px solid rgba(255, 255, 255, 0.15)";
        }
        if (githubDetails) githubDetails.style.display = "none";
        if (paypalDetails) {
            paypalDetails.style.display = "block";
            if (selectedPackage) {
                initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
            }
        }
    }
}

function generateRefCode() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PJ-REF-${randomNum}`;
}

function updateCheckoutSummary() {
    if (!selectedPackage) return;
    const summary = document.getElementById("selectedPkgSummary");
    if (!summary) return;
    
    const usdStr = `$${Number(selectedPackage.price_usd || selectedPackage.price || 0).toFixed(2)} USD`;
    const penStr = `S/. ${Number(selectedPackage.price_pen || 0).toFixed(2)} PEN`;
    summary.innerHTML = `Has seleccionado: <strong style="color:#ffd700;">${selectedPackage.name}</strong> por <strong style="color:#38bdf8;">${usdStr}</strong> <span style="color:#94a3b8;font-size:0.9rem;">(${penStr})</span>`;
    updateDirectPaymentLinks();
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO REMOTO
// ─────────────────────────────────────────────────────────────────────────────
async function loadRemoteCatalog() {
    try {
        const apiUrl = _getApiUrl();
        const ctrl   = new AbortController();
        setTimeout(() => ctrl.abort(), 2500);
        const resp = await fetch(`${apiUrl}/api/shop/catalog`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                currentCatalog = data;
                renderCatalogCards(currentCatalog);
                console.info("[Tienda] Catálogo cargado desde WebAPI:", data.length, "paquetes.");
                return;
            }
        }
    } catch (_) { /* fallback al catálogo local */ }

    // Fallback secundario estático a data/store_catalog.json
    try {
        const respLocal = await fetch("data/store_catalog.json");
        if (respLocal.ok) {
            const dataLocal = await respLocal.json();
            if (Array.isArray(dataLocal) && dataLocal.length > 0) {
                currentCatalog = dataLocal;
                renderCatalogCards(currentCatalog);
                console.info("[Tienda] Catálogo cargado desde data/store_catalog.json");
            }
        }
    } catch (_) { /* fallback a DEFAULT_CATALOG */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER TARJETAS
// ─────────────────────────────────────────────────────────────────────────────
function renderCatalogCards(catalog) {
    const container = document.getElementById("shopCardsContainer");
    if (!container) return;

    const filtered = currentCategory === "all"
        ? catalog
        : catalog.filter(p => p.category === currentCategory);

    if (!filtered.length) {
        container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:2rem;">
            No hay paquetes en esta categoría todavía.</div>`;
        return;
    }

    container.innerHTML = filtered.map(pkg => {
        const r = RARITY_COLORS[pkg.rarity] || RARITY_COLORS.epico;
        const tokens = pkg.tokens ? `<div style="font-size:.8rem;color:${r.text};margin-top:.3rem;font-weight:600;">🪙 ${Number(pkg.tokens).toLocaleString()} Tokens de Jaina</div>` : "";
        
        let rewardsHtml = "";
        if (pkg.rewards && pkg.rewards.length > 0) {
            const itemsList = pkg.rewards.map(rw => {
                let icon = "🎁";
                if (rw.type === "mount") icon = "🐎";
                else if (rw.type === "title") icon = "👑";
                else if (rw.type === "aura") icon = "🪽";
                else if (rw.type === "vip") icon = "⭐";
                else if (rw.type === "money") icon = "💰";
                else if (rw.type === "bp_levels") icon = "⚡";
                else if (rw.name && rw.name.includes("Token")) icon = "🪙";
                return `<span style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:4px;padding:2px 6px;margin:2px 2px 0 0;font-size:0.73rem;color:#e2e8f0;">${icon} ${rw.count > 1 ? rw.count + 'x ' : ''}${rw.name}</span>`;
            }).join("");
            rewardsHtml = `<div style="margin-top:0.45rem;display:flex;flex-wrap:wrap;gap:2px;">${itemsList}</div>`;
        }

        const pricePen = Number(pkg.price_pen || pkg.price || 0).toFixed(2);
        const priceUsd = Number(pkg.price_usd || pkg.price || 0).toFixed(2);
        const displayPrice = currentCurrency === "PEN" 
            ? `S/. ${pricePen} <span style="font-size:0.75rem;color:#94a3b8;">PEN</span>`
            : `$${priceUsd} <span style="font-size:0.75rem;color:#94a3b8;">USD</span>`;

        return `
        <div class="shop-card rarity-${pkg.rarity}"
             id="card-${pkg.id}"
             style="border-color:${r.border};box-shadow:0 0 18px ${r.glow};"
             onmouseenter="this.style.transform='translateY(-6px) scale(1.02)'"
             onmouseleave="this.style.transform=''">
            <div class="shop-card-badge" style="background:${r.border};color:#fff;">${pkg.rarity_label || "ÉPICO"}</div>
            <div class="shop-card-top">
                <div class="shop-icon">${pkg.icon || "✨"}</div>
                <div class="shop-title" style="color:${r.text};">${pkg.name}</div>
                <div class="shop-desc">${pkg.description}</div>
                ${tokens}
                ${rewardsHtml}
            </div>
            <div class="shop-card-bottom">
                <div class="shop-price">${displayPrice}</div>
                <button class="btn-primary btn-block"
                        style="border-color:${r.border};background:linear-gradient(135deg,${r.glow},transparent);"
                        onclick="selectPackage('${pkg.id}','${pkg.name}',${pkg.price_pen || 0},${pkg.price_usd || 0})">
                    ✨ Adquirir Recompensa
                </button>
            </div>
        </div>`;
    }).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECCIÓN DE PAQUETE
// ─────────────────────────────────────────────────────────────────────────────
function selectPackage(id, name, price_pen, price_usd) {
    selectedPackage = { id, name, price_pen, price_usd, price: price_usd };

    const checkout = document.getElementById("checkoutSection");
    updateCheckoutSummary();

    const refElem = document.getElementById("yapeRefCode");
    if (refElem) {
        refElem.innerText = generateRefCode();
    }

    setPaymentMethod(currentPaymentMethod);

    if (checkout) { 
        checkout.style.display = "block"; 
        checkout.scrollIntoView({ behavior:"smooth", block:"center" }); 
    }

    const inp = document.getElementById("targetCharacterName");
    const charName = inp?.value.trim();
    if (charName && charName.length >= 2) {
        _validateCharacterLive();
    } else {
        const btnContainer = document.getElementById("paypal-button-container");
        if (btnContainer && currentPaymentMethod === "paypal") btnContainer.innerHTML = "";
    }
}

function closeCheckout() {
    const c = document.getElementById("checkoutSection");
    if (c) c.style.display = "none";
    _clearCharBadge();
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DINÁMICA DE PAGOS (payment_config.json)
// ─────────────────────────────────────────────────────────────────────────────
let paymentConfig = null;

async function loadPaymentConfig() {
    try {
        const apiUrl = _getApiUrl();
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 2000);
        const resp = await fetch(`${apiUrl}/api/shop/payment_config`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        if (resp.ok) {
            paymentConfig = await resp.json();
            _applyPaymentConfig();
            return;
        }
    } catch (_) { /* fallback local */ }

    try {
        const resp = await fetch("data/payment_config.json");
        if (resp.ok) {
            paymentConfig = await resp.json();
            _applyPaymentConfig();
        }
    } catch (e) {
        console.warn("[PAYMENT CONFIG] No se pudo cargar payment_config.json:", e);
    }
}

function updateDirectPaymentLinks() {
    const pkg = selectedPackage;
    const charName = document.getElementById("targetCharacterName")?.value.trim() || "";
    const donateBtn = document.getElementById("directPaypalDonateBtn");
    const meBtn = document.getElementById("directPaypalMeBtn");

    const baseMe = (paymentConfig?.paypal?.paypal_me) || "https://paypal.me/darckrovert";

    if (!pkg) {
        if (donateBtn) {
            donateBtn.href = baseMe;
            donateBtn.innerHTML = `🪙 Donación Directa vía PayPal.Me (@DarckRovert)`;
        }
        if (meBtn) {
            meBtn.href = baseMe;
            meBtn.innerHTML = `⚡ Enviar aporte vía PayPal.Me (@DarckRovert)`;
        }
        return;
    }

    const priceUsd = Number(pkg.price_usd || pkg.price || 0).toFixed(2);
    const dynamicMeUrl = `${baseMe.replace(/\/+$/, '')}/${priceUsd}usd`;

    if (donateBtn) {
        donateBtn.href = dynamicMeUrl;
        donateBtn.innerHTML = `🪙 Aportar $${priceUsd} USD vía PayPal.Me (@DarckRovert)${charName ? ' (' + charName + ')' : ''}`;
    }
    if (meBtn) {
        meBtn.href = dynamicMeUrl;
        meBtn.innerHTML = `⚡ Enviar $${priceUsd} USD vía PayPal.Me (@DarckRovert)`;
    }
}

function _applyPaymentConfig() {
    if (!paymentConfig) return;
    updateDirectPaymentLinks();
    const ghLink = document.querySelector("#githubDetailsContainer a.btn-primary");
    if (ghLink && paymentConfig.github_sponsors?.sponsor_url) {
        ghLink.href = paymentConfig.github_sponsors.sponsor_url;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMACIÓN DE PAGO VÍA YAPE / PLIN (FLUJO REAL CON PERSISTENCIA EN DB)
// ─────────────────────────────────────────────────────────────────────────────
async function confirmYapePayment() {
    const charName = document.getElementById("targetCharacterName")?.value.trim();
    const feedback = document.getElementById("paymentFeedback");
    const refCode  = document.getElementById("yapeRefCode")?.innerText.trim() || generateRefCode();

    if (!charName) {
        alert("Escribe el nombre exacto de tu personaje antes de continuar.");
        document.getElementById("targetCharacterName")?.focus();
        return;
    }
    if (!selectedPackage) {
        alert("Selecciona un paquete de la tienda primero.");
        return;
    }

    const btn = document.getElementById("btnConfirmYape");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "⏳ Registrando Orden en Base de Datos...";
    }

    try {
        const apiUrl = _getApiUrl();
        const payload = {
            character_name: charName,
            package_id: selectedPackage.id,
            reference_code: refCode,
            payment_method: "YAPE"
        };

        const res = await fetch(`${apiUrl}/api/shop/yape/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (feedback) {
            feedback.style.display = "block";
            if (res.ok && data.ok) {
                feedback.className = "payment-feedback-box success-box";
                const waUrl = data.whatsapp_url || (paymentConfig?.yape_plin?.whatsapp_e164 ? 
                    `https://wa.me/${paymentConfig.yape_plin.whatsapp_e164.replace('+','').replace(/\s+/g,'')}?text=${encodeURIComponent(`Hola, acabo de aportar por Yape para ${charName} por ${selectedPackage.name}. Referencia: ${refCode}`)}` : "");
                const discordUrl = data.discord_url || "https://discord.gg/cXxMuRJrfy";

                const waBtn = waUrl ? 
                    `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:10px; padding:10px 18px; background:#22c55e; color:#052e16; font-weight:800; text-decoration:none; border-radius:8px; font-size:0.95rem; box-shadow: 0 4px 14px rgba(34,197,94,0.4);">📲 Enviar Comprobante por WhatsApp</a>` : '';
                const discordBtn = `<a href="${discordUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:10px; margin-left:8px; padding:10px 18px; background:#5865f2; color:#fff; font-weight:800; text-decoration:none; border-radius:8px; font-size:0.95rem; box-shadow: 0 4px 14px rgba(88,101,242,0.4);">💬 Enviar por Discord</a>`;

                feedback.innerHTML = `
                    <div style="font-size:1.15rem;font-weight:800;color:#38bdf8;">🎉 ¡Orden Registrada en Cola Oficial!</div>
                    <p style="margin:8px 0;font-size:0.92rem;line-height:1.5;">
                        Se ha registrado formalmente tu solicitud para <strong>${charName}</strong> por el paquete <strong>${data.package_name || selectedPackage.name}</strong> (<strong>S/. ${Number(data.price_pen || selectedPackage.price_pen || 0).toFixed(2)}</strong>).
                    </p>
                    <div style="background:rgba(0,0,0,0.4);border:1px dashed #38bdf8;padding:10px 14px;border-radius:6px;margin:10px 0;">
                        Código de Referencia: <strong style="color:#ffd700;letter-spacing:1px;font-size:1.15rem;">${refCode}</strong>
                    </div>
                    <p style="margin:6px 0;font-size:0.85rem;color:#cbd5e1;">
                        Tu orden ha quedado encolada en estado <strong>PENDIENTE DE VERIFICACIÓN</strong>. Pulsa abajo para enviar tu captura de comprobante y recibir tus recompensas in-game en menos de 60 segundos:
                    </p>
                    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap;">
                        ${waBtn}
                        ${discordBtn}
                    </div>
                `;
            } else {
                feedback.className = "payment-feedback-box error-box";
                feedback.innerHTML = `
                    <div style="font-size:1rem;font-weight:800;color:#f87171;">⚠️ Error de Registro</div>
                    <p style="margin:6px 0;font-size:0.88rem;">${data.message || "No se pudo registrar la solicitud."}</p>
                `;
            }
        }
    } catch (err) {
        if (feedback) {
            feedback.style.display = "block";
            feedback.className     = "payment-feedback-box error-box";
            feedback.innerHTML     = `
                <div style="font-size:1rem;font-weight:800;color:#f87171;">⚠️ Registro Offline</div>
                <p style="margin:6px 0;font-size:0.88rem;">
                    No se pudo contactar al servidor Gateway (${err.message}). Por favor envía tu comprobante con el código <strong style="color:#ffd700;">${refCode}</strong> directamente a nuestro Discord oficial: <a href="https://discord.gg/cXxMuRJrfy" target="_blank" style="color:#38bdf8;font-weight:bold;">discord.gg/cXxMuRJrfy</a>.
                </p>
            `;
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerText = "✅ He Realizado el Pago / Notificar Acreditación";
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDACIÓN EN VIVO DEL PERSONAJE (Hito #126 — /api/armory/search)
// ─────────────────────────────────────────────────────────────────────────────
async function _validateCharacterLive() {
    const inp      = document.getElementById("targetCharacterName");
    const charName = inp?.value.trim();
    if (!charName || charName.length < 2) { _clearCharBadge(); return; }

    _showCharBadge("⏳", "#a0a0c0", `Verificando «${charName}» en acore_characters...`);

    try {
        const apiUrl = _getApiUrl();
        const ctrl   = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        const resp = await fetch(
            `${apiUrl}/api/armory/search?name=${encodeURIComponent(charName)}`,
            { signal: ctrl.signal, headers: { "ngrok-skip-browser-warning": "true" } }
        );
        if (resp.ok) {
            const data = await resp.json();
            if (data.found) {
                _validatedChar = data;
                const gsColor = data.gear_score >= 2000 ? "#ffd700" : data.gear_score >= 1200 ? "#00e5ff" : "#a0c4ff";
                _showCharBadge("✅", "#39d353",
                    `<strong>${data.name}</strong> · ${data.class} Nv${data.level} · 
                     <span style="color:${gsColor}">${data.gear_score} GS</span> · 
                     ${data.guild} · ${data.achievements} logros`
                );
                if (currentPaymentMethod === "paypal" && selectedPackage) {
                    initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
                }
            } else {
                _validatedChar = null;
                _showCharBadge("❌", "#ff5252", `«${charName}» no encontrado en acore_characters. Verifica el nombre exacto.`);
            }
        } else if (resp.status === 404) {
            _validatedChar = null;
            _showCharBadge("❌", "#ff5252", `«${charName}» no existe en el servidor. ¿Ya creaste tu cuenta?`);
        } else {
            _showCharBadge("⚠️", "#ffb74d", "Servidor offline. La entrega será validada por el operador.");
        }
    } catch (_) {
        _showCharBadge("⚠️", "#ffb74d", "No se pudo verificar online. La entrega se procesará manualmente.");
        if (currentPaymentMethod === "paypal" && selectedPackage) {
            initPayPalButton(selectedPackage.id, selectedPackage.price_usd || selectedPackage.price);
        }
    }
}

function _showCharBadge(icon, color, html) {
    let badge = document.getElementById("charValidationBadge");
    if (!badge) {
        badge = document.createElement("div");
        badge.id = "charValidationBadge";
        badge.style.cssText = "margin-top:.8rem;padding:.6rem 1rem;border-radius:8px;font-size:.84rem;border:1px solid;transition:all .3s;";
        document.getElementById("targetCharacterName")?.parentElement?.after(badge);
    }
    badge.style.color        = color;
    badge.style.borderColor  = color + "55";
    badge.style.background   = color + "11";
    badge.innerHTML          = `${icon} ${html}`;
    badge.style.display      = "block";
}

function _clearCharBadge() {
    const b = document.getElementById("charValidationBadge");
    if (b) b.style.display = "none";
    _validatedChar = null;
}
// ─────────────────────────────────────────────────────────────────────────────
// PAYPAL SDK
// ─────────────────────────────────────────────────────────────────────────────
function initPayPalButton(packageId, price) {
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    const clientId = (typeof CONFIG !== "undefined" && CONFIG.PAYPAL_CLIENT_ID)
        ? CONFIG.PAYPAL_CLIENT_ID : "sb";

    if (!window.paypal) {
        const script = document.createElement("script");
        script.src     = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.onload  = () => _renderPayPalButtons(container, packageId, price);
        script.onerror = () => {
            container.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem;text-align:center;">
                Pasarela PayPal lista para activación con Client ID de producción.</p>`;
        };
        document.head.appendChild(script);
    } else {
        _renderPayPalButtons(container, packageId, price);
    }
}

function _renderPayPalButtons(container, packageId, price) {
    if (!window.paypal?.Buttons) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem;text-align:center;">
            Pasarela PayPal lista para activación con Client ID de producción.</p>`;
        return;
    }

    window.paypal.Buttons({
        createOrder: (data, actions) => {
            const charName = document.getElementById("targetCharacterName")?.value.trim();
            if (!charName) { 
                alert("Ingresa el nombre de tu personaje para recibir la recompensa."); 
                throw new Error("Nombre requerido"); 
            }
            if (!selectedPackage || !selectedPackage.price) {
                alert("Selecciona un paquete válido.");
                throw new Error("Paquete no seleccionado");
            }
            return actions.order.create({
                purchase_units: [{ 
                    amount: { value: String(selectedPackage.price) }, 
                    description: `Project JAIna - ${selectedPackage.name} (Personaje: ${charName})` 
                }]
            });
        },
        onApprove: async (data, actions) => {
            const feedback = document.getElementById("paymentFeedback");
            const charName = document.getElementById("targetCharacterName")?.value.trim();
            if (feedback) { feedback.style.display = "block"; feedback.className = "payment-feedback-box"; feedback.innerHTML = `⏳ Confirmando orden con el servidor de juego...`; }
            try {
                const details = await actions.order.capture();
                const apiUrl  = _getApiUrl();
                const res = await fetch(`${apiUrl}/api/shop/paypal/capture`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
                    body: JSON.stringify({ order_id: details.id, character_name: charName, package_id: selectedPackage?.id, payer_email: details.payer?.email_address || "" })
                });
                const result = await res.json();
                if (res.ok && result.ok) {
                    feedback.className = "payment-feedback-box success-box";
                    feedback.innerHTML = `🎉 ¡Gracias ${details.payer?.name?.given_name || charName}! ${result.message}`;
                } else {
                    feedback.className = "payment-feedback-box error-box";
                    feedback.innerHTML = `⚠️ Pago en PayPal OK pero el servidor reportó: ${result.message || "Error de entrega"}. Contacta soporte con Order ID: ${details.id}.`;
                }
            } catch (err) {
                if (feedback) { feedback.className = "payment-feedback-box error-box"; feedback.innerHTML = `❌ Error: ${err.message}`; }
            }
        }
    }).render(container);
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTROS DE CATEGORÍA
// ─────────────────────────────────────────────────────────────────────────────
function setupCategoryFilters() {
    document.querySelectorAll(".shop-cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".shop-cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            renderCatalogCards(currentCatalog);
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────
function _getApiUrl() {
    return (typeof CONFIG !== "undefined" && CONFIG.getApiUrl) ? CONFIG.getApiUrl() : "http://127.0.0.1:8080";
}

function _debounce(fn, ms) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
}

function setupCheckoutListeners() {
    const inp = document.getElementById("targetCharacterName");
    if (inp && !inp.dataset.listenerBound) {
        inp.addEventListener("input", () => {
            updateDirectPaymentLinks();
        });
        inp.addEventListener("input", _debounce(_validateCharacterLive, 600));
        inp.dataset.listenerBound = "true";
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TELEMETRÍA DE SOSTENIBILIDAD & META COMUNITARIA (ZERO-P2W)
// ─────────────────────────────────────────────────────────────────────────────
async function loadServerFundingGoal() {
    let data = null;
    try {
        const apiUrl = _getApiUrl();
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 2000);
        const respRemote = await fetch(`${apiUrl}/api/shop/goal`, {
            signal: ctrl.signal,
            headers: { "Accept": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        clearTimeout(timeout);
        if (respRemote.ok) {
            data = await respRemote.json();
        }
    } catch (_) {}

    if (!data) {
        try {
            const respLocal = await fetch("data/server_goal.json");
            if (respLocal.ok) {
                data = await respLocal.json();
            }
        } catch (_) {}
    }

    if (!data) return;

    try {
        const targetPen = Number(data.monthly_target_pen || 180).toFixed(2);
        const raisedPen = Number(data.current_raised_pen || 0).toFixed(2);
        const targetUsd = Number(data.monthly_target_usd || 49.20).toFixed(2);
        const raisedUsd = Number(data.current_raised_usd || 0).toFixed(2);
        const pct = Math.min(100, Math.max(0, (Number(data.current_raised_pen || 0) / Number(data.monthly_target_pen || 180)) * 100)).toFixed(1);

        const fillEl = document.getElementById("fundingProgressFill");
        const raisedEl = document.getElementById("fundingRaisedText");
        const targetEl = document.getElementById("fundingTargetText");
        const pctEl = document.getElementById("fundingPctText");
        const suppEl = document.getElementById("fundingSupportersCount");
        const monthEl = document.getElementById("fundingMonthLabel");

        if (fillEl) fillEl.style.width = `${pct}%`;
        if (raisedEl) raisedEl.innerText = `S/. ${raisedPen} PEN ($${raisedUsd} USD)`;
        if (targetEl) targetEl.innerText = `S/. ${targetPen} PEN ($${targetUsd} USD)`;
        if (pctEl) pctEl.innerText = `${pct}%`;
        if (suppEl && data.supporters_count !== undefined) suppEl.innerText = data.supporters_count;
        if (monthEl && data.month_name) monthEl.innerText = data.month_name;
    } catch (_) {
        // Fallback a los valores estáticos presentes en el DOM
    }
}

