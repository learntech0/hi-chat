# Use the Python3.7.2 container image
FROM python:3.9

ENV PYTHONUNBUFFERED=1

# RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

# set the working directory to /app
WORKDIR /app

# copy the current directory contents into the container at /app
COPY requirements.txt /app

# RUN pip3 install --upgrade pip

# Install the dependencies
RUN pip install -r requirements.txt

COPY app.ini .

COPY . .

ENV PYTHONPATH /app

CMD ["uwsgi", "app.ini"]
