import csv
import random

sectors = ['Agriculture', 'Manufacturing', 'Construction', 'Transport',
    'Information/Communication', 'Finance', 'Real Estate', 'Business Services',
    'Education', 'Health', 'Other']
cities = []
with open('output/worldcitiespop.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        cities.append(row[0:2])

stats = {}
with open('resources/Voice/Hackathon_1.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        if not row[8] or not row[9]: continue

        outbound = stats.get(row[8], {})
        outbound['outbound'] = outbound.get('outbound', 0) + 1
        if not 'name' in outbound:
            city = cities.pop(random.randint(0, len(cities) - 1))
            outbound['name'] = city[1]
            outbound['country'] = city[0]
            outbound['sector'] = random.choice(sectors)
        stats[row[8]] = outbound

        inbound = stats.get(row[9], {})
        inbound['inbound'] = inbound.get('inbound', 0) + 1
        if not 'name' in inbound:
            city = cities.pop(random.randint(0, len(cities) - 1))
            inbound['name'] = city[1]
            inbound['country'] = city[0]
            inbound['sector'] = random.choice(sectors)
        stats[row[9]] = inbound

with open('output/simple.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['region_id', 'output traffic', 'input traffic', 'city', 'country', 'sector'])
    for key, value in stats.iteritems():
        writer.writerow([key, value.get('outbound', 0), value.get('inbound', 0), value.get('name'), value.get('country'), value.get('sector')])
