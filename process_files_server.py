import csv

region_mapping = {}
with open('output/ordered_city.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        region_mapping[row[0]] = {'country': row[5], 'city': row[4], 'sector': row[3], 'latitude': row[6], 'longitude': row[7]}

processed = [['date', 'hour', 'originating_number', 'destination_number',
    'origin_pricing_destination_id', 'pricing_destination_id',
    'conversation_duration', 'originating_city', 'originating_country',
    'originating_latitude', 'originating_longitude',
    'originating_sector', 'destination_city', 'destination_country',
    'destination_sector', 'destination_latitude', 'destination_longitude']]

print 'Starting processing'

with open('resources/Voice/Hackathon_1.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for index, row in enumerate(reader):
        if row[15] == '0' or not row[9] or not row[8] or not row[7] or not row[6] or not row[2] or not row[1]:
            continue

        outbound = region_mapping[row[8]]
        inbound = region_mapping[row[9]]
        processed.append([row[0], row[1], row[6], row[7], row[8], row[9], row[15],
                outbound['city'], outbound['country'], outbound['latitude'], outbound['longitude'], outbound['sector'],
                inbound['city'], inbound['country'], inbound['latitude'], inbound['longitude'], inbound['sector']])

        length = len(processed)
        if length % 100 == 0:
            print 'At row ' + str(length)
        elif length > 2000:
            break

print 'Completed processing'

with open('output/processed_hackathon_server.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    for row in processed:
        writer.writerow(row)
