import csv
import random

sectors = ['Agriculture', 'Manufacturing', 'Construction', 'Transport',
    'Communication', 'Finance', 'Real Estate', 'Business Services',
    'Education', 'Health', 'Other']
cities = []
with open('output/worldcitiespop.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        cities.append(row)

print 'Reading input data'

stats = {}
with open('resources/Voice/Hackathon_1.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        if row[15] == '0' or not row[8] or not row[9]: continue

        outbound = stats.get(row[8], {})
        outbound['outbound'] = outbound.get('outbound', 0) + 1
        if not 'sector' in outbound: outbound['sector'] = random.choice(sectors)
        stats[row[8]] = outbound

        inbound = stats.get(row[9], {})
        inbound['inbound'] = inbound.get('inbound', 0) + 1
        if not 'sector' in inbound: inbound['sector'] = random.choice(sectors)
        stats[row[9]] = inbound

print 'Converting to a list'

stats_list = []
for key, value in stats.iteritems():
    stats_list.append([key, value.get('outbound', 0), value.get('inbound', 0), value.get('sector', '')])

print 'Sorting'

stats_list.sort(key=lambda x: x[1], reverse=True)

popular_cities = [
        ['London', 'gb', '17.9833333', '-88.4333333'],
        ['New York', 'us', '53.083333', '-.15'],
        ['Chicago', 'us', '14.083333', '-91.616667'],
        ['Singapore', 'sg', '1.2930556', '103.8558333'],
        ['Mumbai', 'in', '18.975', '72.825833'],
        ['Hong Kong', 'hk', '22.2833333', '114.15'],
        ['Moscow', 'ru', '55.752222', '37.615556'],
        ['Beijing', 'cn', '39.8825', '123.911944'],
        ['Shanghai', 'cn', '31.045556', '121.399722'],
        ['Tokyo', 'jp', '35.685', '139.751389']]

print 'Adding cities'
for index, item in enumerate(stats_list):
    if index < 10:
        item.append(popular_cities[index][0])
        item.append(popular_cities[index][1])
        item.append(popular_cities[index][2])
        item.append(popular_cities[index][3])
    else:
        city = cities.pop(random.randint(0, len(cities) - 1))
        item.append(city[1])
        item.append(city[0])
        item.append(city[5])
        item.append(city[6])

print 'Writing to output file'
with open('output/ordered_city.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['region_id', 'output traffic', 'input traffic', 'sector', 'city', 'country', 'latitude', 'longitude'])

    for item in stats_list:
        writer.writerow(item)
