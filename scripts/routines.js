async function loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return await response.json();
}

async function generateRoutine(skinType, issues = []) {
    const baseRoutines = await loadJSON("baseRoutines.json");
    const issueModifiers = await loadJSON("issueModifiers.json");

    const base = JSON.parse(JSON.stringify(baseRoutines[skinType]));
    if (!base) throw new Error("Invalid skin type");

    for (const issue of issues) {
        const mods = issueModifiers[issue];
        if (!mods) continue;

        for (const time of['morningRoutine', 'nightRoutine']) {
            const modsForTime = mods[time];
            const routine = base[time];

            for (const step in modsForTime) {
                const prodId = modsForTime[step].id;
                if (!prodId) continue;

                routine[step] = prodId; // zëvendëso ose shto
            }
        }
    }

    return base;
}

// Shembull përdorimi pas DOMContentLoaded
document.addEventListener("DOMContentLoaded", async() => {
    try {
        const routine = await generateRoutine("dry", ["acne", "pigmentation"]);
        console.log("Rutinë e personalizuar:", routine);
    } catch (err) {
        console.error("Gabim në gjenerimin e rutinës:", err);
    }
});