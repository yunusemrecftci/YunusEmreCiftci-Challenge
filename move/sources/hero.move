module challenge::hero;

use std::string::String;
use sui::event;
// ========= STRUCTS =========
public struct Hero has key, store {
    id: sui::object::UID,
    name: String,
    image_url: String,
    power: u64,
}

public struct HeroMetadata has key, store {
    id: sui::object::UID,
    timestamp: u64,
}

// ========= EVENTS =========

public struct HeroCreated has copy, drop {
    hero_id: sui::object::ID,
    timestamp: u64,
}

// ========= FUNCTIONS =========

#[allow(lint(self_transfer))]
public fun create_hero(
    name: String,
    image_url: String,
    power: u64,
    ctx: &mut sui::tx_context::TxContext,
) {
    let hero = Hero {
        id: sui::object::new(ctx),
        name,
        image_url,
        power,
    };
    let hero_id = sui::object::id(&hero);
    sui::transfer::transfer(hero, ctx.sender());

    let metadata = HeroMetadata {
        id: sui::object::new(ctx),
        timestamp: ctx.epoch_timestamp_ms(),
    };
    sui::transfer::freeze_object(metadata);

    event::emit(HeroCreated { hero_id, timestamp: ctx.epoch_timestamp_ms() });
}

// ========= GETTER FUNCTIONS =========

public fun hero_power(hero: &Hero): u64 {
    hero.power
}

#[test_only]
public fun hero_name(hero: &Hero): String {
    hero.name
}

#[test_only]
public fun hero_image_url(hero: &Hero): String {
    hero.image_url
}

#[test_only]
public fun hero_id(hero: &Hero): sui::object::ID {
    sui::object::id(hero)
}
