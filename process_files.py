import csv
import random

region_mapping = {}
with open('output/simple.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        region_mapping[row[0]] = {'country': row[4], 'city': row[3], 'sector': row[5]}

processed = [['Date', 'Hour', 'Originating Number', 'Destination Number',
    'Origin Pricing Destination id', 'Pricing Destination id',
    'Conversation Duration', 'Originating City', 'Originating Country',
    'Originating Sector', 'Destination City', 'Destination Country',
    'Destination Sector']]

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
                outbound['city'], outbound['country'], outbound['sector'],
                inbound['city'], inbound['country'], inbound['sector']])

        if index % 100 == 0:
            print 'At row ' + str(index)

print 'Completed processing'

with open('output/processed_hackathon_1.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    for row in processed:
        writer.writerow(row)
