export function AnnouncementBar() {
  const messages = [
    'FREE DELIVERY WITHIN NIGERIA ON ORDERS ABOVE ₦500,000',
    'NEW ARRIVALS — THE CRIMSON HOUR COLLECTION',
    'EXCLUSIVE MEMBERSHIP — JOIN THE SILVER LEAGUE',
  ];

  return (
    <div className="bg-burgundy-dark text-cream py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...messages, ...messages, ...messages, ...messages].map((msg, i) => (
          <span
            key={i}
            className="text-[10px] tracking-wider-luxe uppercase mx-12 inline-block"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
