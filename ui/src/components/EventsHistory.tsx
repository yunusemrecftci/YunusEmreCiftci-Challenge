import { useSuiClientQueries } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Badge, Grid } from "@radix-ui/themes";
import { useNetworkVariable } from "../networkConfig";

export default function EventsHistory() {
  const packageId = useNetworkVariable("packageId");

  const eventQueries = useSuiClientQueries({
    queries: [
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::hero::HeroCreated`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "HeroCreated"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::marketplace::HeroListed`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "HeroListed"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::marketplace::HeroBought`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "HeroBought"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::marketplace::HeroDelisted`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "HeroDelisted"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::marketplace::HeroPriceChanged`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "HeroPriceChanged"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::arena::ArenaCreated`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "ArenaCreated"],
        enabled: !!packageId,
      },
      {
        method: "queryEvents",
        params: {
          query: {
            MoveEventType: `${packageId}::arena::ArenaCompleted`,
          },
          limit: 20,
          order: "descending",
        },
        queryKey: ["queryEvents", packageId, "ArenaCompleted"],
        enabled: !!packageId,
      },
    ],
  });

  const [
    { data: heroCreatedEvents, isPending: isHeroCreatedPending },
    { data: listedEvents, isPending: isListedPending },
    { data: boughtEvents, isPending: isBoughtPending },
    { data: delistedEvents, isPending: isDelistedPending },
    { data: priceChangedEvents, isPending: isPriceChangedPending },
    { data: battleCreatedEvents, isPending: isBattleCreatedPending },
    { data: battleCompletedEvents, isPending: isBattleCompletedPending },
  ] = eventQueries;

  const formatTimestamp = (timestamp: string) => {
    return new Date(Number(timestamp)).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: string) => {
    return (Number(price) / 1_000_000_000).toFixed(2);
  };

  if (
    isHeroCreatedPending ||
    isListedPending ||
    isBoughtPending ||
    isDelistedPending ||
    isPriceChangedPending ||
    isBattleCreatedPending ||
    isBattleCompletedPending
  ) {
    return (
      <Card>
        <Text>Loading events history...</Text>
      </Card>
    );
  }

  const allEvents = [
    ...(heroCreatedEvents?.data || []).map((event) => ({
      ...event,
      type: "hero_created" as const,
    })),
    ...(listedEvents?.data || []).map((event) => ({
      ...event,
      type: "listed" as const,
    })),
    ...(boughtEvents?.data || []).map((event) => ({
      ...event,
      type: "bought" as const,
    })),
    ...(delistedEvents?.data || []).map((event) => ({
      ...event,
      type: "delisted" as const,
    })),
    ...(priceChangedEvents?.data || []).map((event) => ({
      ...event,
      type: "price_changed" as const,
    })),
    ...(battleCreatedEvents?.data || []).map((event) => ({
      ...event,
      type: "battle_created" as const,
    })),
    ...(battleCompletedEvents?.data || []).map((event) => ({
      ...event,
      type: "battle_completed" as const,
    })),
  ].sort((a, b) => Number(b.timestampMs) - Number(a.timestampMs));

  return (
    <Flex direction="column" gap="4">
      <Heading size="6">Recent Events ({allEvents.length})</Heading>

      {allEvents.length === 0 ? (
        <Card>
          <Text>No events found</Text>
        </Card>
      ) : (
        <Grid columns="1" gap="3">
          {allEvents.map((event, index) => {
            const eventData = event.parsedJson as any;

            return (
              <Card
                key={`${event.id.txDigest}-${index}`}
                style={{ padding: "16px" }}
              >
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="3">
                    <Badge
                      color={
                        event.type === "hero_created"
                          ? "blue"
                          : event.type === "listed"
                            ? "blue"
                          : event.type === "bought"
                            ? "green"
                            : event.type === "delisted"
                              ? "gray"
                              : event.type === "price_changed"
                                ? "purple"
                                : event.type === "battle_created"
                                  ? "orange"
                                  : "red"
                      }
                      size="2"
                    >
                      {event.type === "hero_created"
                        ? "Hero Created"
                        : event.type === "listed"
                          ? "Hero Listed"
                        : event.type === "bought"
                          ? "Hero Bought"
                          : event.type === "delisted"
                            ? "Hero Delisted"
                            : event.type === "price_changed"
                              ? "Price Changed"
                              : event.type === "battle_created"
                                ? "Arena Created"
                                : "Battle Completed"}
                    </Badge>
                    <Text size="3" color="gray">
                      {formatTimestamp(event.timestampMs!)}
                    </Text>
                  </Flex>

                  <Flex align="center" gap="4" wrap="wrap">
                    {event.type === "hero_created" && (
                      <>
                        <Text size="3">
                          <strong>Hero created</strong>
                        </Text>
                        <Text
                          size="3"
                          color="gray"
                          style={{ fontFamily: "monospace" }}
                        >
                          ID: {eventData.hero_id?.slice(0, 8)}...
                        </Text>
                      </>
                    )}

                    {(event.type === "listed" || event.type === "bought") && (
                      <>
                        <Text size="3">
                          <strong>Price:</strong> {formatPrice(eventData.price)}{" "}
                          SUI
                        </Text>

                        {event.type === "listed" ? (
                          <Text size="3">
                            <strong>Seller:</strong>{" "}
                            {formatAddress(eventData.seller)}
                          </Text>
                        ) : (
                          <Flex gap="4">
                            <Text size="3">
                              <strong>Buyer:</strong>{" "}
                              {formatAddress(eventData.buyer)}
                            </Text>
                            <Text size="3">
                              <strong>Seller:</strong>{" "}
                              {formatAddress(eventData.seller)}
                            </Text>
                          </Flex>
                        )}

                        <Text
                          size="3"
                          color="gray"
                          style={{ fontFamily: "monospace" }}
                        >
                          ID: {eventData.list_hero_id.slice(0, 8)}...
                        </Text>
                      </>
                    )}

                    {event.type === "delisted" && (
                      <>
                        <Text size="3">
                          <strong>Seller:</strong> {formatAddress(eventData.seller)}
                        </Text>
                        <Text
                          size="3"
                          color="gray"
                          style={{ fontFamily: "monospace" }}
                        >
                          ID: {eventData.list_hero_id.slice(0, 8)}...
                        </Text>
                      </>
                    )}

                    {event.type === "price_changed" && (
                      <>
                        <Text size="3">
                          <strong>Old Price:</strong> {formatPrice(eventData.old_price)} SUI
                        </Text>
                        <Text size="3">
                          <strong>New Price:</strong> {formatPrice(eventData.new_price)} SUI
                        </Text>
                        <Text
                          size="3"
                          color="gray"
                          style={{ fontFamily: "monospace" }}
                        >
                          ID: {eventData.list_hero_id.slice(0, 8)}...
                        </Text>
                      </>
                    )}

                    {event.type === "battle_created" && (
                      <>
                        <Text size="3">
                          <strong>⚔️ Battle Arena Created</strong>
                        </Text>
                        <Text
                          size="3"
                          color="gray"
                          style={{ fontFamily: "monospace" }}
                        >
                          ID: {eventData.arena_id.slice(0, 8)}...
                        </Text>
                      </>
                    )}

                    {event.type === "battle_completed" && (
                      <>
                        <Text size="3">
                          <strong>🏆 Winner:</strong> ...
                          {eventData.winner_hero_id.slice(-8)}
                        </Text>
                        <Text size="3">
                          <strong>💀 Loser:</strong> ...
                          {eventData.loser_hero_id.slice(-8)}
                        </Text>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      )}
    </Flex>
  );
}
