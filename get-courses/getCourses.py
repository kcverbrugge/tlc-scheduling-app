import pandas as pd
import boto3    #AWS SDK for connecting to DynamoDB
import uuid # for generating unique IDs
#we need these IDs bc when we call .create() in amplify, it creates a unique ID for each item
#But we are bypassing that so we need to create our own unique IDs

# Read and clean the excel spreadsheet
df = pd.read_excel("courses.xlsx", usecols=["SUBJ", "NUMB", "TITLE"])
df = df.drop_duplicates(subset=["SUBJ", "NUMB", "TITLE"]).copy()   # remove duplicates
df["SUBJ"]  = df["SUBJ"].str.strip().str.upper()
df["NUMB"]  = df["NUMB"].astype(str).str.strip()
df["TITLE"] = df["TITLE"].str.strip()

# Initialize DynamoDB and point to your table
dynamodb = boto3.resource("dynamodb")   #connect to DynamoDB
table = dynamodb.Table("Course-jx7t2rt6tza2liazvjmmdbedly-NONE")  #point to the correct table

# Write to DynamoDB
with table.batch_writer() as batch:
    for _, row in df.iterrows(): #iterate through each row of the dataframe
        batch.put_item(
            Item={
                "id":             str(uuid.uuid4()),
                "departmentCode": row["SUBJ"],
                "courseNumber":   row["NUMB"],
                "courseName":     row["TITLE"],
            }
        )
