// Matchmaker++
ipcRenderer.on('joinMatch', async () => {
    if (matchmakerCooldown) {
        tools.sendFakeChat("Please wait before trying again...", '#fc03ec');
        return;
    }

    matchmakerCooldown = true;
    setTimeout(function () {
        matchmakerCooldown = false;
    }, 3 * 1000);

    if (matchmakerChatOutputMode !== 'none') tools.sendFakeChat("Searching for games...", '#fc03ec');

    const MODES = {
        ffa: 0,
        tdm: 1,
        point: 2,
        ctf: 3,
        bhop: 4,
        hide: 5,
        infect: 6,
        race: 7,
        lms: 8,
        simon: 9,
        gun: 10,
        prop: 11,
        boss: 12,
        class: 13,
        depo: 14,
        stalk: 15,
        king: 16,
        oitc: 17,
        trade: 18,
        kc: 19,
        def: 20,
        sharp: 21,
        trai: 22,
        raid: 23,
        blitz: 24,
        dom: 25,
        sdm: 26,
        krank: 27,
        tdf: 28,
        depoffa: 29,
        chs: 33,
        bhffa: 34,
        zomb: 35,
        gdepo: 36
    };

    function noMatchFound() {
        if (matchmakerChatOutputMode === 'none') return;
        tools.sendFakeChat(langPack.misc.noJoinableGames, '#fc03ec');
        if (joinRandomGameWhenNoneFound) window.open(`https://krunker.io/`);
    }
    function matchFound(match) {
        if (matchmakerChatOutputMode === 'none') return;
        let mInfo = (matchmakerChatOutputMode === 'showGameLink') ? `: https://krunker.io/?game=${match}` : '';
        tools.sendFakeChat(`Match found${mInfo}...`, '#fc03ec');
        window.open(`https://krunker.io/?game=${match}`);
    }
    function checkMatches(data) {
        let selectedGame = null;
        for (let i = 0; i < data.length; i++) {
            if (location.href !== `https://krunker.io/?game=${data[i][0]}`) {
                selectedGame = data[i][0];
                break;
            }
        }
        if (selectedGame === null) {
            noMatchFound();
            return;
        }

        matchFound(selectedGame);
    }

    fetch('https://matchmaker.krunker.io/game-list?hostname=krunker.io', { cache: "no-store" }) //no cache = no false "no game found" messages :D
        .then(res => res.json())
        .then(data => {
            let region = null;
            if (joinMatchPresentRegion) {
                let gameActivity = false;
                try { gameActivity = window.getGameActivity() } catch { }
                try {
                    region = new RegExp(`${gameActivity.id.slice(0, 3)}:.+`);
                } catch {
                    let lastRegion = localStorage.getItem('lastRegion'); //backup :D
                    if (lastRegion === null) {
                        region = new RegExp(/.+:.+/);
                    } else {
                        region = new RegExp(`${lastRegion}:.+`);
                    }
                }
            }
            else {
                region = new RegExp(/.+:.+/);
            }

            let dGF = ignoreEmptyGames ? data.games.filter(game => game[2] > 0) : data.games; //empty check
            const joinableGames = dGF.filter(game => (game[2] < game[3]) && (game[4].g === MODES[joinMatchMode] || joinMatchMode === 'all') && (joinMatchCustom ? game[4].c : (!game[4].c || game[4].c == 0)) && (joinMatchOCustom ? game[4].oc : (!game[4].oc || game[4].oc == 0)));
            const joinableGames_regionFiltered = joinableGames.filter(game => region.test(game[0])); //region check
            joinableGames_regionFiltered.sort(function (a, b) {
                if (a[2] > b[2]) return -1;
                if (a[2] < b[2]) return 1;
                return 0;
            });

            if (joinableGames_regionFiltered.length) {
                checkMatches(joinableGames_regionFiltered);
            }
            else {
                if (searchOtherRegionsOnEmpty) {
                    joinableGames.sort(function (a, b) {
                        if (a[2] > b[2]) return -1;
                        if (a[2] < b[2]) return 1;
                        return 0;
                    });

                    if (joinableGames.length) {
                        checkMatches(joinableGames);
                    } else {
                        noMatchFound();
                    }
                } else {
                    noMatchFound();
                }
            }
        }).catch(() => {
            if (matchmakerChatOutputMode !== 'none') tools.sendFakeChat('Matchmaker Error', '#fc03ec');
        });
});