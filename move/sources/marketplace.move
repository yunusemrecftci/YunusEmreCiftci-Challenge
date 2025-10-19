module challenge::marketplace;

use challenge::hero::Hero;
use sui::coin::{Self as coin, Coin};
use sui::event;

// ========= ERRORS =========

const EInvalidPayment: u64 = 1;

// ========= STRUCTS =========

public struct ListHero has key, store {
    id: sui::object::UID,
    nft: Hero,
    price: u64,
    seller: address,
}

// ========= CAPABILITIES =========

public struct AdminCap has key, store {
    id: sui::object::UID,
}

// ========= EVENTS =========

public struct HeroListed has copy, drop {
    list_hero_id: sui::object::ID,
    price: u64,
    seller: address,
    timestamp: u64,
}

public struct HeroBought has copy, drop {
    list_hero_id: sui::object::ID,
    price: u64,
    buyer: address,
    seller: address,
    timestamp: u64,
}

// Additional marketplace lifecycle events
public struct HeroDelisted has copy, drop {
    list_hero_id: sui::object::ID,
    seller: address,
}

public struct HeroPriceChanged has copy, drop {
    list_hero_id: sui::object::ID,
    old_price: u64,
    new_price: u64,
}

// ========= FUNCTIONS =========

fun init(ctx: &mut sui::tx_context::TxContext) {
    let admin_cap = AdminCap {
        id: sui::object::new(ctx),
    };
    sui::transfer::public_transfer(admin_cap, ctx.sender());
}

public fun list_hero(nft: Hero, price: u64, ctx: &mut sui::tx_context::TxContext) {
    let list_hero = ListHero {
        id: sui::object::new(ctx),
        nft,
        price,
        seller: ctx.sender(),
    };

    event::emit(HeroListed {
        list_hero_id: sui::object::id(&list_hero),
        price,
        seller: ctx.sender(),
        timestamp: ctx.epoch_timestamp_ms(),
    });

    sui::transfer::share_object(list_hero);
}

#[allow(lint(self_transfer))]
public fun buy_hero(
    list_hero: ListHero,
    coin: Coin<sui::sui::SUI>,
    ctx: &mut sui::tx_context::TxContext,
) {
    let ListHero { id, nft, price, seller } = list_hero;

    assert!(coin::value(&coin) == price, EInvalidPayment);

    sui::transfer::public_transfer(coin, seller);
    sui::transfer::public_transfer(nft, ctx.sender());

    event::emit(HeroBought {
        list_hero_id: sui::object::uid_to_inner(&id),
        price,
        buyer: ctx.sender(),
        seller,
        timestamp: ctx.epoch_timestamp_ms(),
    });

    sui::object::delete(id);
}

// ========= ADMIN FUNCTIONS =========

public fun delist(_: &AdminCap, list_hero: ListHero) {
    let ListHero { id, nft, price: _, seller } = list_hero;

    // Emit delist event before deleting the ID
    event::emit(HeroDelisted {
        list_hero_id: sui::object::uid_to_inner(&id),
        seller,
    });

    sui::transfer::public_transfer(nft, seller);
    sui::object::delete(id);
}

public fun change_the_price(_: &AdminCap, list_hero: &mut ListHero, new_price: u64) {
    let old_price = list_hero.price;
    list_hero.price = new_price;

    // Emit price change event
    event::emit(HeroPriceChanged {
        list_hero_id: sui::object::id(list_hero),
        old_price,
        new_price,
    });
}

// ========= GETTER FUNCTIONS =========

#[test_only]
public fun listing_price(list_hero: &ListHero): u64 {
    list_hero.price
}

// ========= TEST ONLY FUNCTIONS =========

#[test_only]
public fun test_init(ctx: &mut sui::tx_context::TxContext) {
    let admin_cap = AdminCap {
        id: sui::object::new(ctx),
    };
    sui::transfer::transfer(admin_cap, ctx.sender());
}
