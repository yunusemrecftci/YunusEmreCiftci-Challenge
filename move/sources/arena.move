module challenge::arena;

use challenge::hero::{Self as hero, Hero};
use std::string::String;
use sui::event;

// ========= STRUCTS =========

public struct Arena has key, store {
    id: sui::object::UID,
    warrior: Hero,
    owner: address,
}

// ========= EVENTS =========

public struct ArenaCreated has copy, drop {
    arena_id: sui::object::ID,
    timestamp: u64,
}

public struct ArenaCompleted has copy, drop {
    winner_hero_id: sui::object::ID,
    loser_hero_id: sui::object::ID,
    timestamp: u64,
}

// ========= FUNCTIONS =========

public fun create_hero(
    name: String,
    image_url: String,
    power: u64,
    ctx: &mut sui::tx_context::TxContext,
) {
    hero::create_hero(name, image_url, power, ctx);
}

public fun create_arena(hero: Hero, ctx: &mut sui::tx_context::TxContext) {
    let arena = Arena {
        id: sui::object::new(ctx),
        warrior: hero,
        owner: ctx.sender(),
    };

    event::emit(ArenaCreated {
        arena_id: sui::object::id(&arena),
        timestamp: ctx.epoch_timestamp_ms(),
    });

    sui::transfer::share_object(arena);
}

#[allow(lint(self_transfer))]
public fun battle(hero: Hero, arena: Arena, ctx: &mut sui::tx_context::TxContext) {
    let Arena { id, warrior, owner } = arena;

    let challenger_power = hero::hero_power(&hero);
    let defender_power = hero::hero_power(&warrior);

    if (challenger_power > defender_power) {
        let winner_id = sui::object::id(&hero);
        let loser_id = sui::object::id(&warrior);

        sui::transfer::public_transfer(warrior, ctx.sender());
        sui::transfer::public_transfer(hero, ctx.sender());

        event::emit(ArenaCompleted {
            winner_hero_id: winner_id,
            loser_hero_id: loser_id,
            timestamp: ctx.epoch_timestamp_ms(),
        });
    } else {
        let winner_id = sui::object::id(&warrior);
        let loser_id = sui::object::id(&hero);

        sui::transfer::public_transfer(hero, owner);
        sui::transfer::public_transfer(warrior, owner);

        event::emit(ArenaCompleted {
            winner_hero_id: winner_id,
            loser_hero_id: loser_id,
            timestamp: ctx.epoch_timestamp_ms(),
        });
    };

    sui::object::delete(id);
}
