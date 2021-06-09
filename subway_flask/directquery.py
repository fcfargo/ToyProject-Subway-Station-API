import pymysql
import db_config

class DirectQuery():    
    def execute_query(self, sql):
        conn = pymysql.connect(
            host     ='localhost', user=db_config.DATABASES['USER'],
            password =db_config.DATABASES['PASSWORD'], db=db_config.DATABASES['NAME'], 
            charset  ='utf8mb4', port=3306
        )
        try:
            with conn.cursor() as cursor:
                cursor.execute(sql)
                data   = [x for x in cursor.fetchall()] if cursor else None
                
            conn.commit()
            conn.close()
        except:
            data = 'sql error'
            
        return data