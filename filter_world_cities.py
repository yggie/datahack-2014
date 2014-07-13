import csv

countries = ['gb', 'us', 'cn', 'de', 'nz', 'ar', 'be', 'ca', 'cu', 'eg', 'sg']
filtered_rows = []

with open('worldcitiespop.csv', 'rb') as csvfile:
    reader = csv.reader(csvfile)
    next(reader)
    for row in reader:
        if row[0] in countries: filtered_rows.append(row)

with open('output/worldcitiespop.csv', 'wb') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Country', 'City', 'AccentCity', 'Region', 'Population', 'Latitude', 'Longitude'])
    for row in filtered_rows:
        writer.writerow(row)
